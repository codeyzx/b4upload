"""
Setup script for top_videos MongoDB collection and indexes.
Run this script once to create the collection and indexes.

Usage:
    python setup_top_videos_collection.py
"""

import os
from pymongo import MongoClient, DESCENDING
import logging

logging.basicConfig(level=logging.INFO)

def setup_top_videos_collection():
    """
    Create top_videos collection and indexes.
    """
    try:
        # Get connection string from environment
        connection_string = os.environ.get("MONGODB_CONNECTION_STRING")
        if not connection_string:
            raise ValueError("MONGODB_CONNECTION_STRING environment variable not set")
        
        # Connect to MongoDB
        logging.info("Connecting to MongoDB...")
        client = MongoClient(connection_string)
        db = client["b4upload_db"]
        
        # Create collection (if not exists)
        if "top_videos" not in db.list_collection_names():
            db.create_collection("top_videos")
            logging.info("✅ Created top_videos collection")
        else:
            logging.info("ℹ️  top_videos collection already exists")
        
        collection = db["top_videos"]
        
        # Create indexes
        # Index on engagement_rate (descending) for potential future sorting
        collection.create_index([("engagement_rate", DESCENDING)], name="engagement_rate_desc")
        logging.info("✅ Created index on engagement_rate (descending)")
        
        # Index on last_updated (descending) for update detection
        collection.create_index([("last_updated", DESCENDING)], name="last_updated_desc")
        logging.info("✅ Created index on last_updated (descending)")
        
        # List all indexes
        indexes = list(collection.list_indexes())
        logging.info(f"📋 Collection indexes: {[idx['name'] for idx in indexes]}")
        
        logging.info("✅ Setup completed successfully!")
        
    except Exception as e:
        logging.error(f"❌ Setup failed: {e}")
        raise

if __name__ == "__main__":
    setup_top_videos_collection()
