"""
Migration script to populate initial top_videos collection.
Run this script once after deploying the new top videos feature.

Usage:
    python migrate_to_top_videos.py
"""

import os
import sys
from pymongo import MongoClient, DESCENDING
import logging

# Add parent directory to path to import function_app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from function_app import get_database, update_top_videos

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

def verify_historical_data():
    """
    Verify that historical_data collection has videos.
    """
    try:
        db = get_database()
        collection = db["historical_data"]
        
        count = collection.count_documents({})
        logging.info(f"📊 Found {count} videos in historical_data collection")
        
        if count == 0:
            logging.warning("⚠️  No videos found in historical_data collection")
            logging.warning("Please run the daily fetch first to populate historical_data")
            return False
        
        return True
    except Exception as e:
        logging.error(f"❌ Failed to verify historical_data: {e}")
        return False

def verify_indexes():
    """
    Verify that top_videos collection has required indexes.
    """
    try:
        db = get_database()
        collection = db["top_videos"]
        
        indexes = list(collection.list_indexes())
        index_names = [idx['name'] for idx in indexes]
        
        logging.info(f"📋 Existing indexes: {index_names}")
        
        required_indexes = ['engagement_rate_desc', 'last_updated_desc']
        missing_indexes = [idx for idx in required_indexes if idx not in index_names]
        
        if missing_indexes:
            logging.warning(f"⚠️  Missing indexes: {missing_indexes}")
            logging.info("Creating missing indexes...")
            
            if 'engagement_rate_desc' in missing_indexes:
                collection.create_index([("engagement_rate", DESCENDING)], name="engagement_rate_desc")
                logging.info("✅ Created engagement_rate_desc index")
            
            if 'last_updated_desc' in missing_indexes:
                collection.create_index([("last_updated", DESCENDING)], name="last_updated_desc")
                logging.info("✅ Created last_updated_desc index")
        else:
            logging.info("✅ All required indexes exist")
        
        return True
    except Exception as e:
        logging.error(f"❌ Failed to verify indexes: {e}")
        return False

def run_migration():
    """
    Run the complete migration process.
    """
    logging.info("🚀 Starting migration to top_videos system...")
    logging.info("=" * 60)
    
    # Step 1: Verify historical_data has videos
    logging.info("\n📋 Step 1: Verifying historical_data collection...")
    if not verify_historical_data():
        logging.error("❌ Migration aborted: No data in historical_data")
        return False
    
    # Step 2: Verify indexes
    logging.info("\n📋 Step 2: Verifying indexes...")
    if not verify_indexes():
        logging.error("❌ Migration aborted: Index verification failed")
        return False
    
    # Step 3: Run initial update_top_videos
    logging.info("\n📋 Step 3: Populating top_videos collection...")
    try:
        update_top_videos()
        logging.info("✅ Successfully populated top_videos collection")
    except Exception as e:
        logging.error(f"❌ Failed to populate top_videos: {e}")
        return False
    
    # Step 4: Verify results
    logging.info("\n📋 Step 4: Verifying results...")
    try:
        db = get_database()
        collection = db["top_videos"]
        
        count = collection.count_documents({})
        logging.info(f"📊 top_videos collection now has {count} documents")
        
        if count > 0:
            # Show top 3 videos
            top_3 = list(collection.find().sort("engagement_rate", DESCENDING).limit(3))
            logging.info("\n🏆 Top 3 videos:")
            for i, video in enumerate(top_3, 1):
                desc = video.get('description', 'No description')[:50]
                rate = video.get('engagement_rate', 0)
                logging.info(f"  #{i}: {desc}... (engagement: {rate:.2f}%)")
        
        logging.info("\n" + "=" * 60)
        logging.info("✅ Migration completed successfully!")
        logging.info("\nNext steps:")
        logging.info("1. Deploy frontend changes to use useTopVideos hook")
        logging.info("2. Monitor /api/top-videos endpoint")
        logging.info("3. Verify auto-refresh works (check every 5 minutes)")
        
        return True
    except Exception as e:
        logging.error(f"❌ Failed to verify results: {e}")
        return False

if __name__ == "__main__":
    try:
        success = run_migration()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        logging.info("\n⚠️  Migration interrupted by user")
        sys.exit(1)
    except Exception as e:
        logging.error(f"❌ Migration failed with unexpected error: {e}")
        sys.exit(1)
