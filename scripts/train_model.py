import os
import pandas as pd
import numpy as np
import joblib
import re
import shap
from pymongo import MongoClient
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from lightgbm import LGBMClassifier
from datetime import datetime


# --- 1. KONEKSI DATABASE ---
def get_data_from_mongo():
    print("🔌 Menghubungkan ke MongoDB...")
    connection_string = os.environ.get("MONGODB_CONNECTION_STRING")
    if not connection_string:
        raise ValueError(
            "Environment variable MONGODB_CONNECTION_STRING tidak ditemukan!"
        )

    with MongoClient(connection_string) as client:
        db = client["b4upload_db"]
        collection = db["historical_data"]

        # Ambil semua data
        data = list(collection.find({}, {"_id": 0}))
        print(f"📦 Berhasil mengambil {len(data)} data dari MongoDB.")
        return pd.DataFrame(data)


# --- 2. PREPROCESSING ---
def extract_hashtags_count(text):
    if not isinstance(text, str):
        return 0
    return len(re.findall(r"#\w+", text))


def preprocess_data(df):
    print("🧹 Memulai Preprocessing...")

    # A. Flatten Stats
    if "stats" in df.columns and not df.empty and isinstance(df.iloc[0]["stats"], dict):
        stats_df = pd.json_normalize(df["stats"])
        df = pd.concat([df.drop(["stats"], axis=1), stats_df], axis=1)

    # B. Target Engineering
    cols_to_numeric = [
        "play_count",
        "digg_count",
        "comment_count",
        "share_count",
        "video_duration",
    ]
    for col in cols_to_numeric:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Hindari pembagian nol
    df["play_count"] = df["play_count"].replace(0, 1)

    # Rumus Engagement Rate
    df["engagement_rate"] = (
        df["digg_count"] + df["comment_count"] + df["share_count"]
    ) / df["play_count"]

    df["engagement_rate"] = df["engagement_rate"].replace([np.inf, -np.inf], np.nan)
    df.dropna(subset=["engagement_rate"], inplace=True)

    # C. Labeling
    def label_eng(rate):
        if rate < 0.02:
            return "rendah"
        elif rate < 0.06:
            return "sedang"
        else:
            return "tinggi"

    df["engagement_label"] = df["engagement_rate"].apply(label_eng)

    # D. Feature Extraction: Hashtags
    if "hashtags_count" not in df.columns:
        if "description" in df.columns:
            df["hashtags_count"] = df["description"].apply(extract_hashtags_count)
        else:
            df["hashtags_count"] = 0

    # E. Feature Extraction: Time
    if "create_time" in df.columns:
        df["upload_datetime"] = pd.to_datetime(df["create_time"], unit="s")
    else:
        df["upload_datetime"] = pd.to_datetime(datetime.now())

    df["upload_hour"] = df["upload_datetime"].dt.hour
    df["upload_day"] = df["upload_datetime"].dt.dayofweek
    df["upload_month"] = df["upload_datetime"].dt.month

    # F. Music Cleaning
    if "music_title" not in df.columns:
        df["music_title"] = "Original Sound"
    df["music_title"] = df["music_title"].astype(str).fillna("Original Sound")

    return df


# --- 3. TRAINING PIPELINE ---
def train():
    # 1. Load Data
    df = get_data_from_mongo()

    if len(df) < 10:
        print(
            "⚠️  WARNING: Data terlalu sedikit (< 10 baris). Hasil mungkin tidak akurat."
        )

    # 2. Preprocess
    df = preprocess_data(df)

    # 3. Define Features & Target
    feature_cols = [
        "video_duration",
        "hashtags_count",
        "upload_hour",
        "upload_day",
        "upload_month",
        "music_title",
    ]
    target_col = "engagement_label"

    X = df[feature_cols].copy()
    y = df[target_col]

    # 4. Encoding Music
    print("🎵 Encoding Music...")
    music_encoder = LabelEncoder()
    X["music_title"] = music_encoder.fit_transform(X["music_title"])

    # 5. Encoding Target
    print("🎯 Encoding Target...")
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # 6. Split Data
    try:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
    except ValueError:
        print(
            "⚠️  Data tidak seimbang untuk Stratified Split. Menggunakan Random Split biasa."
        )
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )

    # 7. Train Model
    print("🚀 Melatih Model LightGBM...")

    min_child = 1 if len(X_train) < 50 else 20

    model = LGBMClassifier(
        n_estimators=500,
        learning_rate=0.05,
        max_depth=-1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_samples=min_child,
        random_state=42,
        verbose=-1,
    )
    model.fit(X_train, y_train)
    print("✅ Model training selesai!")

    # 8. Evaluasi
    print("📊 Evaluasi Model:")
    y_pred = model.predict(X_test)

    # Handle report labels agar konsisten (mencegah error jika ada label yg hilang di test set)
    all_labels = np.arange(len(label_encoder.classes_))

    try:
        report = classification_report(
            y_test,
            y_pred,
            labels=all_labels,
            target_names=label_encoder.classes_,
            zero_division=0,
        )
        print(report)
    except Exception as e:
        print(f"⚠️  Gagal mencetak report detail: {e}")
        print(f"Akurasi kasar: {np.mean(y_test == y_pred):.2f}")

    # 9. SHAP
    print("🧠 Membuat SHAP Explainer...")
    explainer = shap.TreeExplainer(model)

    # --- 4. SAVE ARTIFACTS
    current_script_dir = os.path.dirname(os.path.abspath(__file__))

    # Naik satu level ke atas untuk dapat root project
    project_root = os.path.dirname(current_script_dir)

    # Tentukan folder models di root
    models_dir = os.path.join(project_root, "api", "models")

    print(f"💾 Menyimpan Artifacts ke: {models_dir}")
    os.makedirs(models_dir, exist_ok=True)

    joblib.dump(model, os.path.join(models_dir, "b4upload_model.pkl"))
    joblib.dump(label_encoder, os.path.join(models_dir, "label_encoder.pkl"))
    joblib.dump(music_encoder, os.path.join(models_dir, "music_encoder.pkl"))
    joblib.dump(explainer, os.path.join(models_dir, "shap_explainer.pkl"))

    print("✅ Training Selesai & Artifacts tersimpan!")


if __name__ == "__main__":
    try:
        train()
        print("🎉 Program selesai dijalankan dengan sukses!")
    except Exception as e:
        print(f"❌ Terjadi error fatal: {e}")
