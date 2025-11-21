import azure.functions as func
import logging
import os
import requests
import json
from pymongo import MongoClient
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from shared.model_loader import model_loader

app = func.FunctionApp()


# --- 1. KONEKSI DATABASE (Sama seperti sebelumnya) ---
def get_database():
    try:
        connection_string = os.environ.get("MONGODB_CONNECTION_STRING")
        client = MongoClient(connection_string)
        return client["b4upload_db"]
    except Exception as e:
        logging.error(f"Gagal konek ke MongoDB: {e}")
        raise e


# --- 2. FUNGSI FETCH DATA (DISESUAIKAN DENGAN API ANDA) ---
def fetch_trending_tiktok():
    # URL dari script JS Anda
    url = "https://tiktok-api23.p.rapidapi.com/api/post/trending"

    # Parameter sesuai script JS Anda
    querystring = {"count": "16"}

    headers = {
        "x-rapidapi-key": os.environ.get("RAPIDAPI_KEY"),
        "x-rapidapi-host": os.environ.get(
            "RAPIDAPI_HOST"
        ),  # tiktok-api23.p.rapidapi.com
    }

    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()

        # Script JS Anda mengecek "itemList"
        if not data or "itemList" not in data:
            logging.warning("Response API tidak memiliki 'itemList'")
            return []

        return data["itemList"]  # Mengembalikan list video

    except Exception as e:
        logging.error(f"Error fetching data from tiktok-api23: {e}")
        return []


# --- 3. FUNGSI CLEANING & FORMATTING ---
def process_video_data(raw_item):
    """
    Mengubah raw data dari API menjadi format yang siap untuk Database & AI.
    Menangani kemungkinan key yang berbeda/kosong dengan .get()
    """
    # Mapping field disesuaikan dengan struktur umum tiktok-api23
    # (Perlu disesuaikan jika struktur raw JSON berbeda sedikit)

    video_id = raw_item.get("id") or raw_item.get("video_id")
    desc = raw_item.get("desc", "")

    # Ekstraksi Hashtag Manual
    hashtags = [tag.strip("#") for tag in desc.split() if tag.startswith("#")]

    # Author info
    author = raw_item.get("author", {})

    # Stats info
    stats = raw_item.get("stats", {})

    # Music info
    music = raw_item.get("music", {})

    clean_doc = {
        "_id": video_id,  # Primary Key
        "video_id": video_id,
        "author_username": author.get("uniqueId") or author.get("nickname"),
        "author_id": author.get("id"),
        "description": desc,
        "hashtags": hashtags,
        "hashtags_count": len(hashtags),
        "create_time": raw_item.get("createTime"),
        # Simpan metrics untuk AI
        "stats": {
            "play_count": stats.get("playCount", 0),
            "digg_count": stats.get("diggCount", 0),
            "comment_count": stats.get("commentCount", 0),
            "share_count": stats.get("shareCount", 0),
        },
        "video_duration": raw_item.get("video", {}).get("duration", 0),
        "music_title": music.get("title", "Original Sound"),
        "fetched_at": datetime.now(),  # Timestamp pengambilan data
    }

    return clean_doc


# --- 4. SCHEDULER (PENGGANTI SETINTERVAL) ---
# Ganti "0 0 0 * * *" jika ingin interval lain.
# Contoh tiap 10 menit: "0 */10 * * * *"
@app.schedule(
    schedule="0 0 0 * * *", arg_name="myTimer", run_on_startup=False, use_monitor=False
)
def daily_fetch_tiktok(myTimer: func.TimerRequest) -> None:
    if myTimer.past_due:
        logging.info("The timer is past due!")

    logging.info(
        "🚀 [Azure Function] Memulai fetch trending (Replacement for JS Script)..."
    )

    # A. Konek Database
    db = get_database()
    collection = db["historical_data"]

    # B. Fetch dari API
    video_list = fetch_trending_tiktok()
    logging.info(f"📦 Berhasil mengambil {len(video_list)} items dari API.")

    if not video_list:
        logging.info("Tidak ada data untuk disimpan.")
        return

    # C. Simpan ke MongoDB (Upsert Strategy)
    # Kita tidak pakai "append file" seperti di JS, tapi "Upsert" database
    # Agar data tidak duplikat tapi selalu ter-update
    success_count = 0
    for item in video_list:
        try:
            clean_data = process_video_data(item)

            # Update jika ada, Insert jika baru
            collection.update_one(
                {"_id": clean_data["_id"]}, {"$set": clean_data}, upsert=True
            )
            success_count += 1
        except Exception as e:
            logging.warning(f"Gagal memproses item: {e}")

    logging.info(
        f"✅ Selesai! {success_count} data berhasil disimpan/diupdate di MongoDB."
    )


# --- 5. API ENDPOINT UNTUK PREDIKSI ENGAGEMENT ---
@app.route(route="predict", auth_level=func.AuthLevel.ANONYMOUS, methods=["POST"])
def predict_engagement(req: func.HttpRequest) -> func.HttpResponse:
    """
    API endpoint untuk memprediksi engagement video TikTok
    Input: JSON dengan video_duration, hashtags_count, schedule_time, music_title
    Output: JSON dengan prediction, confidence_score, probabilities
    """
    logging.info("🚀 Predict engagement API called")

    try:
        # Parse input JSON
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                status_code=400,
                mimetype="application/json",
            )

        # Validasi input fields
        required_fields = [
            "video_duration",
            "hashtags_count",
            "schedule_time",
            "music_title",
        ]
        for field in required_fields:
            if field not in req_body:
                return func.HttpResponse(
                    json.dumps({"error": f"Missing required field: {field}"}),
                    status_code=400,
                    mimetype="application/json",
                )

        # Extract input data
        video_duration = req_body["video_duration"]
        hashtags_count = req_body["hashtags_count"]
        schedule_time = req_body["schedule_time"]
        music_title = req_body["music_title"]

        # Feature engineering dari schedule_time
        try:
            schedule_dt = datetime.fromisoformat(schedule_time.replace("Z", "+00:00"))
            upload_hour = schedule_dt.hour
            upload_day = schedule_dt.weekday()  # 0=Monday, 6=Sunday
            upload_month = schedule_dt.month
        except Exception as e:
            logging.error(f"Error parsing schedule_time: {e}")
            return func.HttpResponse(
                json.dumps({"error": "Invalid schedule_time format. Use ISO format."}),
                status_code=400,
                mimetype="application/json",
            )

        # Load models
        try:
            model = model_loader.get_model()
            label_encoder = model_loader.get_label_encoder()
        except Exception as e:
            logging.error(f"Model loading error: {e}")
            return func.HttpResponse(
                json.dumps({"error": "Model not initialized"}),
                status_code=500,
                mimetype="application/json",
            )

        # Encode music title
        try:
            music_encoded = model_loader.encode_music(music_title)
        except Exception as e:
            logging.error(f"Music encoding error: {e}")
            music_encoded = 0  # fallback value

        # Prepare feature vector untuk model
        # Sesuaikan dengan feature order yang digunakan saat training
        features = [
            video_duration,
            hashtags_count,
            upload_hour,
            upload_day,
            upload_month,
            music_encoded,
        ]

        # Convert ke format yang dibutuhkan model (2D array)
        feature_array = np.array([features])

        logging.info(f"Features prepared: {features}")

        # Prediksi
        try:
            # Get prediction (class)
            prediction_numeric = model.predict(feature_array)[0]
            prediction_label = label_encoder.inverse_transform([prediction_numeric])[0]

            # Get probabilities
            probabilities = model.predict_proba(feature_array)[0]
            class_labels = label_encoder.classes_

            # Confidence score = probabilitas dari kelas yang diprediksi
            confidence_score = float(max(probabilities))

            # Format probabilities untuk response
            prob_list = []
            for i, prob in enumerate(probabilities):
                prob_list.append({"label": class_labels[i], "score": float(prob)})

            # Response JSON
            response_data = {
                "prediction": prediction_label,
                "confidence_score": confidence_score,
                "probabilities": prob_list,
                "shap_insight": f"Video duration ({video_duration}s) and hashtags ({hashtags_count}) contribute to engagement prediction.",
            }

            logging.info(
                f"✅ Prediction successful: {prediction_label} with confidence {confidence_score:.2f}"
            )

            return func.HttpResponse(
                json.dumps(response_data), status_code=200, mimetype="application/json"
            )

        except Exception as e:
            logging.error(f"Prediction error: {e}")
            return func.HttpResponse(
                json.dumps({"error": f"Prediction failed: {str(e)}"}),
                status_code=500,
                mimetype="application/json",
            )

    except Exception as e:
        logging.error(f"General API error: {e}")
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json",
        )
