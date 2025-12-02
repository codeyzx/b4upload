import azure.functions as func
import logging
import os
import requests
import json
from pymongo import MongoClient
from datetime import datetime, timezone
import numpy as np
from shared.model_loader import model_loader

app = func.FunctionApp()


# --- 1. KONEKSI DATABASE (Sama seperti sebelumnya) ---
def get_database():
    try:
        connection_string = os.environ.get("MONGODB_CONNECTION_STRING")
        if not connection_string:
            logging.error("MONGODB_CONNECTION_STRING environment variable not set")
            raise ValueError("MongoDB connection string not configured")
        
        # Log connection attempt without exposing credentials
        logging.info("Attempting MongoDB connection...")
        client = MongoClient(connection_string)
        logging.info("MongoDB connection successful")
        return client["b4upload_db"]
    except Exception as e:
        # Log error without exposing connection string or credentials
        error_msg = str(e)
        # Remove any potential connection string from error message
        if "mongodb" in error_msg.lower():
            error_msg = "MongoDB connection failed - check connection string format"
        logging.error(f"Failed to connect to MongoDB: {error_msg}")
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
def calculate_engagement_rate(stats):
    """
    Calculate engagement rate as (likes / views) * 100
    Returns formatted percentage string
    """
    try:
        play_count = stats.get("play_count", 0)
        digg_count = stats.get("digg_count", 0)
        
        if play_count == 0:
            return "0.00%"
        
        rate = (digg_count / play_count) * 100
        return f"{rate:.2f}%"
    except Exception as e:
        logging.warning(f"Error calculating engagement rate: {e}")
        return "0.00%"


def format_timestamp(timestamp):
    """
    Format timestamp to readable date-time string
    Input: Unix timestamp (seconds) or datetime object
    Output: "YYYY-MM-DD HH:MM:SS" format
    """
    try:
        if isinstance(timestamp, (int, float)):
            dt = datetime.fromtimestamp(timestamp)
        elif isinstance(timestamp, datetime):
            dt = timestamp
        else:
            return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except Exception as e:
        logging.warning(f"Error formatting timestamp: {e}")
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def extract_hashtags(description):
    """
    Extract hashtags from description
    Returns list of hashtags without # symbol
    """
    try:
        if not description:
            return []
        
        hashtags = [tag.strip("#") for tag in description.split() if tag.startswith("#")]
        return hashtags
    except Exception as e:
        logging.warning(f"Error extracting hashtags: {e}")
        return []


def format_number(num):
    """
    Format number with K/M suffixes
    """
    try:
        if num >= 1000000:
            return f"{num / 1000000:.2f}M"
        elif num >= 1000:
            return f"{num / 1000:.1f}K"
        else:
            return str(num)
    except Exception as e:
        logging.warning(f"Error formatting number: {e}")
        return "0"


def transform_mongo_doc(doc):
    """
    Transform MongoDB document to frontend-friendly format
    Handles missing fields gracefully with defaults
    
    Note: Tidak mengirim URL yang expired. Frontend akan generate TikTok URL
    menggunakan author_username dan video_id.
    """
    doc_id = doc.get("_id", "unknown")
    try:
        # Extract stats
        stats = doc.get("stats", {})
        play_count = stats.get("play_count", 0)
        digg_count = stats.get("digg_count", 0)
        
        # Calculate engagement rate
        engagement_rate = calculate_engagement_rate(stats)
        
        # Format timestamp
        create_time = doc.get("create_time", 0)
        publication_time = format_timestamp(create_time)
        
        # Format duration
        video_duration = doc.get("video_duration", 0)
        duration_str = f"{video_duration}s"
        
        # Get music title with default
        music_title = doc.get("music_title") or "Original Sound"
        
        transformed = {
            "_id": str(doc.get("_id", "")),
            "video_id": doc.get("video_id", ""),
            
            # Author Information
            "author_username": doc.get("author_username", "Unknown"),
            "author_nickname": doc.get("author_nickname", ""),
            "author_id": doc.get("author_id", ""),
            "author_followers": doc.get("author_followers", 0),
            "author_verified": doc.get("author_verified", False),
            
            # Description and hashtags
            "description": doc.get("description", ""),
            "hashtags": doc.get("hashtags", []),
            "hashtags_count": doc.get("hashtags_count", 0),
            "create_time": create_time,
            
            # Video Metadata
            "video_duration": video_duration,
            
            # Engagement Statistics
            "stats": {
                "play_count": play_count,
                "digg_count": digg_count,
                "comment_count": stats.get("comment_count", 0),
                "share_count": stats.get("share_count", 0),
                "collect_count": stats.get("collect_count", 0),
            },
            
            # Music info
            "music_title": music_title,
            
            # Metadata
            "fetched_at": doc.get("fetched_at", datetime.now()).isoformat() if hasattr(doc.get("fetched_at"), "isoformat") else str(doc.get("fetched_at", "")),
            
            # Additional formatted fields for frontend
            "formatted_views": format_number(play_count),
            "formatted_likes": format_number(digg_count),
            "engagement_rate": engagement_rate,
            "publication_time": publication_time,
            "duration": duration_str,
        }
        
        return transformed
    except Exception as e:
        logging.error(f"Error transforming document {doc_id}: {str(e)[:200]}")
        # Return minimal valid document with all fields
        return {
            "_id": str(doc.get("_id", "")),
            "video_id": doc.get("video_id", ""),
            "author_username": "Unknown",
            "author_nickname": "",
            "author_id": "",
            "author_followers": 0,
            "author_verified": False,
            "description": "",
            "hashtags": [],
            "hashtags_count": 0,
            "create_time": 0,
            "video_duration": 0,
            "stats": {
                "play_count": 0,
                "digg_count": 0,
                "comment_count": 0,
                "share_count": 0,
                "collect_count": 0,
            },
            "music_title": "Original Sound",
            "fetched_at": datetime.now().isoformat(),
            "formatted_views": "0",
            "formatted_likes": "0",
            "engagement_rate": "0.00%",
            "publication_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "duration": "0s",
        }


def process_video_data(raw_item):
    """
    Mengubah raw data dari API menjadi format yang siap untuk Database & AI.
    Menangani kemungkinan key yang berbeda/kosong dengan .get()
    
    Note: Tidak menyimpan URL yang expired (avatar, thumbnail, video URL).
    TikTok URL akan di-generate di frontend menggunakan author_username dan video_id.
    """
    # Mapping field disesuaikan dengan struktur umum tiktok-api23
    # (Perlu disesuaikan jika struktur raw JSON berbeda sedikit)

    video_id = raw_item.get("id") or raw_item.get("video_id")
    desc = raw_item.get("desc", "")

    # Ekstraksi Hashtag Manual
    hashtags = [tag.strip("#") for tag in desc.split() if tag.startswith("#")]

    # Author info - extract comprehensive author details
    author = raw_item.get("author", {})
    author_stats = author.get("stats", {})

    # Stats info
    stats = raw_item.get("stats", {})

    # Music info
    music = raw_item.get("music", {})
    
    # Video info
    video = raw_item.get("video", {})

    clean_doc = {
        "_id": video_id,  # Primary Key
        "video_id": video_id,
        
        # Author Information
        "author_username": author.get("uniqueId") or "Unknown",
        "author_nickname": author.get("nickname") or "",
        "author_id": author.get("id") or "",
        "author_followers": author_stats.get("followerCount", 0),
        "author_verified": author.get("verified", False),
        
        # Description and hashtags
        "description": desc,
        "hashtags": hashtags,
        "hashtags_count": len(hashtags),
        "create_time": raw_item.get("createTime"),
        
        # Video Metadata
        "video_duration": video.get("duration", 0),
        
        # Engagement Statistics (organized with new collect_count field)
        "stats": {
            "play_count": stats.get("playCount", 0),
            "digg_count": stats.get("diggCount", 0),
            "comment_count": stats.get("commentCount", 0),
            "share_count": stats.get("shareCount", 0),
            "collect_count": stats.get("collectCount", 0),
        },
        
        # Music info
        "music_title": music.get("title", "Original Sound"),
        
        # Metadata
        "fetched_at": datetime.now(),  # Timestamp pengambilan data
    }

    return clean_doc


# --- 4. UPDATE TOP VIDEOS FUNCTION ---
def update_top_videos():
    """
    Calculate engagement rates for all videos in historical_data,
    select top 10, and update top_videos collection.
    
    This function:
    1. Queries all videos from historical_data
    2. Calculates engagement rate for each video
    3. Sorts by engagement rate descending
    4. Selects top 10 videos
    5. Clears top_videos collection
    6. Inserts top 10 with engagement_rate and last_updated fields
    """
    try:
        logging.info("🔄 Starting top_videos update process...")
        
        # Connect to database
        db = get_database()
        historical_collection = db["historical_data"]
        top_videos_collection = db["top_videos"]
        
        # Query all videos from historical_data
        all_videos = list(historical_collection.find({}))
        logging.info(f"📊 Found {len(all_videos)} videos in historical_data")
        
        if not all_videos:
            logging.warning("⚠️  No videos found in historical_data, skipping update")
            return
        
        # Calculate engagement rate for each video
        videos_with_engagement = []
        skipped_count = 0
        
        for video in all_videos:
            try:
                stats = video.get("stats", {})
                
                # Validate stats
                if not stats or not isinstance(stats, dict):
                    logging.warning(f"Skipping video {video.get('_id', 'unknown')}: invalid stats")
                    skipped_count += 1
                    continue
                
                play_count = stats.get("play_count", 0)
                digg_count = stats.get("digg_count", 0)
                
                # Handle division by zero
                if play_count == 0:
                    engagement_rate = 0.0
                else:
                    engagement_rate = (digg_count / play_count) * 100
                
                # Add engagement rate to video document
                video["engagement_rate"] = engagement_rate
                videos_with_engagement.append(video)
                
            except Exception as e:
                logging.warning(f"Error processing video {video.get('_id', 'unknown')}: {str(e)[:100]}")
                skipped_count += 1
                continue
        
        if skipped_count > 0:
            logging.info(f"⚠️  Skipped {skipped_count} videos due to invalid data")
        
        if not videos_with_engagement:
            logging.error("❌ No valid videos to process, aborting update")
            return
        
        # Sort by engagement rate descending
        videos_with_engagement.sort(key=lambda x: x["engagement_rate"], reverse=True)
        
        # Select top 10 videos
        top_10 = videos_with_engagement[:10]
        logging.info(f"✅ Selected top {len(top_10)} videos")
        
        # Add last_updated timestamp to each video
        current_time = datetime.now()
        for video in top_10:
            video["last_updated"] = current_time
        
        # Clear top_videos collection
        try:
            delete_result = top_videos_collection.delete_many({})
            logging.info(f"🗑️  Cleared {delete_result.deleted_count} old documents from top_videos")
        except Exception as e:
            logging.error(f"❌ Failed to clear top_videos collection: {e}")
            logging.error("Aborting update to preserve existing data")
            return
        
        # Insert new top 10 videos
        try:
            insert_result = top_videos_collection.insert_many(top_10)
            logging.info(f"✅ Inserted {len(insert_result.inserted_ids)} videos into top_videos")
            logging.info(f"📅 Update completed at {current_time.isoformat()}")
            
            # Log top 3 videos for verification
            for i, video in enumerate(top_10[:3], 1):
                logging.info(f"  #{i}: {video.get('description', 'No description')[:50]}... (engagement: {video['engagement_rate']:.2f}%)")
            
        except Exception as e:
            logging.error(f"❌ Failed to insert top videos: {e}")
            # Attempt to rollback by keeping collection empty is acceptable
            # since we already cleared it
            raise
        
    except Exception as e:
        logging.error(f"❌ Top videos update failed: {str(e)[:200]}")
        raise


# --- 5. SCHEDULER (PENGGANTI SETINTERVAL) ---
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
    
    # D. Update top_videos collection
    try:
        logging.info("🔄 Triggering top_videos update...")
        update_top_videos()
        logging.info("✅ Top videos update completed successfully")
    except Exception as e:
        logging.error(f"❌ Top videos update failed: {e}")
        logging.error("Continuing with existing top_videos data")


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


# --- 6. API ENDPOINT UNTUK TOP 10 VIDEOS ---
@app.route(route="top-videos", auth_level=func.AuthLevel.ANONYMOUS, methods=["GET"])
def get_top_videos(req: func.HttpRequest) -> func.HttpResponse:
    """
    API endpoint untuk mengambil top 10 videos dari MongoDB
    No pagination - returns all videos from top_videos collection (max 10)
    Output: JSON dengan videos, count, last_updated
    """
    logging.info("🚀 Get top videos API called")

    try:
        # Connect to MongoDB
        try:
            db = get_database()
            collection = db["top_videos"]
        except Exception as e:
            # Log error without exposing connection string
            logging.error(f"Database connection error (top-videos endpoint): {str(e)[:100]}")
            return func.HttpResponse(
                json.dumps({
                    "error": "Database connection failed",
                    "code": "DB_CONNECTION_ERROR"
                }),
                status_code=500,
                mimetype="application/json",
            )

        # Query all documents from top_videos (no sorting/filtering needed)
        try:
            # Get all documents from top_videos collection
            raw_videos = list(collection.find({}))
            
            logging.info(f"📊 Found {len(raw_videos)} videos in top_videos collection")
            
            # Get last_updated timestamp from first video (all should have same timestamp)
            last_updated = None
            if raw_videos:
                last_updated_dt = raw_videos[0].get("last_updated")
                if last_updated_dt:
                    if isinstance(last_updated_dt, datetime):
                        last_updated = last_updated_dt.isoformat()
                    else:
                        last_updated = str(last_updated_dt)
            
            # Transform documents with error resilience
            videos = []
            failed_count = 0
            for video in raw_videos:
                try:
                    transformed = transform_mongo_doc(video)
                    videos.append(transformed)
                except Exception as e:
                    failed_count += 1
                    logging.warning(f"Failed to transform video {video.get('_id', 'unknown')}: {str(e)[:100]}")
                    # Continue processing other videos

            if failed_count > 0:
                logging.warning(f"Failed to transform {failed_count} out of {len(raw_videos)} documents")

            # Response JSON
            response_data = {
                "videos": videos,
                "count": len(videos),
                "last_updated": last_updated or datetime.now().isoformat(),
            }

            logging.info(f"✅ Top videos fetched: {len(videos)} videos")

            return func.HttpResponse(
                json.dumps(response_data), status_code=200, mimetype="application/json"
            )

        except Exception as e:
            logging.error(f"Database query error: {e}")
            return func.HttpResponse(
                json.dumps({
                    "error": "Database query failed",
                    "code": "DB_QUERY_ERROR"
                }),
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



