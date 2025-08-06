import pymongo # PyMongo import kiya
import json
from dotenv import load_dotenv
import os
load_dotenv()
# --- MongoDB Configuration ---
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_Agent")
MONGO_COLLECTION_NAME = os.getenv("MONGO_COLLECTION_Agent")

# Your existing all_reviews data
all_reviews = {
    "NationalSecurityReview": {
        "criteria": """
- Portrays military operations, strategies, or decisions in a negative light
- Contradicts official narratives about wars (1965, 1971, etc.)
- Reveals sensitive information about military or security operations
- Suggests military failures or incompetence
- Criticizes military leadership's decision-making
""",
        "guidelines": """
1. Uphold national unity
2. Avoid anti-state narratives
3. Protect military confidentiality and dignity
"""
    },
    "InstitutionalIntegrityReview": {
        "criteria": """
- Undermines the reputation of state institutions (particularly the Army)
- Suggests corruption, incompetence, or overreach by institutions
- Portrays military rule as harmful to the country
- Suggests institutional failures or abuses of power
- Criticizes military or intelligence agencies' actions or motivations
""",
        "guidelines": """
1. Maintain the dignity of state institutions
2. Avoid narratives that question institutional loyalty or capacity
3. Uphold trust in governance systems
"""
    },
    "HistoricalNarrativeReview": {
        "criteria": """
- Contradicts official historical narratives about key events
- Criticizes founding leaders or their decisions
- Provides alternative interpretations of partition or creation of Pakistan
- Presents the 1971 war in a way that differs from official narrative
- Questions decisions made by historical leadership
""",
        "guidelines": """
1. Preserve national historical consensus
2. Promote respect for founding figures
3. Prevent distortion of sensitive historical events
"""
    },
    "ForeignRelationsReview": {
        "criteria": """
- Contains criticism of allied nations (China, Saudi Arabia, Turkey, etc.)
- Discusses sensitive topics related to allied nations
- Makes comparisons that could offend foreign partners
- Suggests policies or actions that contradict official foreign policy
- Contains language that could harm bilateral relations
""",
        "guidelines": """
1. Maintain diplomatic tone
2. Avoid content harmful to strategic alliances
3. Uphold alignment with foreign policy
"""
    },
    "FederalUnityReview": {
        "criteria": """
- Creates or reinforces divisions between provinces or ethnic groups
- Suggests preferential treatment of certain regions or ethnicities
- Highlights historical grievances between regions
- Portrays certain ethnic groups as dominating others
- Discusses separatist movements or provincial alienation
""",
        "guidelines": """
1. Promote inter-provincial harmony
2. Avoid content that deepens ethnic or regional divides
3. Support narratives of national cohesion
"""
    },
    "FactCheckingReview": {
        "criteria": """
- Contains factual inaccuracies (dates, numbers, statistics)
- Makes claims without proper citations or evidence
- Provides statistics that cannot be verified
- Presents disputed facts as established truth
- Contains unsupported generalizations
""",
        "guidelines": """
1. Ensure factual accuracy
2. Require evidence for claims
3. Avoid spreading misinformation
"""
    },
    "RhetoricToneReview": {
        "criteria": """
- Uses emotionally charged or inflammatory language
- Contains sweeping generalizations or absolute statements
- Uses rhetoric that could be divisive or provocative
- Employs exaggeration or hyperbole on sensitive topics
- Attributes motives without evidence
""",
        "guidelines": """
1. Promote measured and respectful language
2. Avoid inflammatory tone on sensitive issues
3. Encourage neutral and objective expression
"""
    }
}

def insert_all_reviews_to_mongo(reviews_data: dict):
    """
    Connects to MongoDB, clears existing agent configurations,
    and inserts new agent configurations from the provided dictionary.
    """
    client = None
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        collection = db[MONGO_COLLECTION_NAME]

        # Clear existing data in the collection
        print(f"\n--- Clearing existing data in MongoDB collection '{MONGO_COLLECTION_NAME}' ---")
        delete_result = collection.delete_many({})
        print(f"Deleted {delete_result.deleted_count} existing documents.")

        documents_to_insert = []
        for agent_name, content in reviews_data.items():
            # MongoDB will store each review as a separate document.
            # The structure will be:
            # {
            #   "agent_name": "NationalSecurityReview",
            #   "criteria": "...",
            #   "guidelines": "..."
            # }
            document = {
                "agent_name": agent_name,
                "criteria": content["criteria"],
                "guidelines": content["guidelines"]
            }
            documents_to_insert.append(document)

        if documents_to_insert:
            insert_result = collection.insert_many(documents_to_insert)
            print(f"Successfully inserted {len(insert_result.inserted_ids)} new agent configurations into MongoDB.")
        else:
            print("No agent configurations to insert.")

    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error: {e}")
        print("Please ensure MongoDB server is running on localhost:27017.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
    finally:
        if client:
            client.close()
            print("MongoDB connection closed.")

def show_agent_json_from_mongo():
    """
    Retrieves and prints agent configurations from the MongoDB collection.
    """
    client = None
    try:
        client = pymongo.MongoClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
        collection = db[MONGO_COLLECTION_NAME]

        print(f"\n--- Current Agent Configurations in MongoDB Collection '{MONGO_COLLECTION_NAME}' ---")
        for doc in collection.find({}):
            print(f"Agent Name: {doc.get('agent_name', 'N/A')}")
            print(f"Criteria:\n{doc.get('criteria', 'N/A')}")
            print(f"Guidelines:\n{doc.get('guidelines', 'N/A')}")
            print("-" * 50)

    except pymongo.errors.ConnectionFailure as e:
        print(f"❌ MongoDB connection error: {e}")
        print("Please ensure MongoDB server is running on localhost:27017.")
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
    finally:
        if client:
            client.close()
            print("MongoDB connection closed.")

if __name__ == '__main__':
    # Insert data into MongoDB
    insert_all_reviews_to_mongo(all_reviews)

    # Show data from MongoDB to verify
    show_agent_json_from_mongo()


