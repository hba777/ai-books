import pymongo
from config import MONGO_URI, PDF_DB_NAME, PDF_COLLECTION_NAME

def update_pending_status_casing():
    mongo_client = None
    try:
        mongo_client = pymongo.MongoClient(MONGO_URI)
        pdf_db = mongo_client[PDF_DB_NAME]
        chunks_collection = pdf_db[PDF_COLLECTION_NAME]

        print(f"Attempting to update 'analysis_status' from 'pending' (lowercase) to 'Pending' (capital) in '{PDF_DB_NAME}.{PDF_COLLECTION_NAME}'...")

        # Update all documents where analysis_status is 'pending' to 'Pending'
        update_result = chunks_collection.update_many(
            {"analysis_status": "pending"}, # Query for lowercase 'pending'
            {"$set": {"analysis_status": "Pending"}} # Set to capital 'Pending'
        )

        if update_result.modified_count > 0:
            print(f"✅ Successfully updated {update_result.modified_count} documents. 'analysis_status' casing standardized.")
        else:
            print("ℹ️ No documents found with 'analysis_status: \"pending\"' to update, or they are already standardized.")

    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error: {e}")
        print("Please ensure your MongoDB server is running and MONGO_URI in config.py is correct.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
    finally:
        if mongo_client:
            mongo_client.close()

if __name__ == "__main__":
    update_pending_status_casing()