import azure.functions as func
import logging
import os
import requests
import json
from pymongo import MongoClient
from datetime import datetime

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
    schedule="0 0 0 * * *", arg_name="myTimer", run_on_startup=True, use_monitor=False
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
