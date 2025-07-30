# 🇵🇰 Pakistan Content Review System 🇵🇰

## AI-Powered Review for National Narratives

![GitHub Workflow Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Python Version](https://img.shields.io/badge/Python-3.9%2B-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Overview

This project provides an **AI-powered system designed to review content, particularly from books on Pakistan's history and politics.** Its primary goal is to identify text segments that may not align with official Pakistani policies, national narratives, or cultural sensitivities.

Leveraging advanced Large Language Models (LLMs), LangChain, LangGraph, and a robust MongoDB/ChromaDB backend, this system automates the preliminary review process, highlighting potentially problematic content for further human examination.


---


## 📋 Setup Instructions

Follow these steps to get your project up and running locally.

### 1. Clone the Repository

First, clone this repository to your local machine:

```bash
git clone [https://github.com/JamshaidBasit/Document_Analysis1.git](https://github.com/JamshaidBasit/Document_Analysis1.git)
cd Document_Analysis1 # Navigate into your project directory

```

### 2. Create a Virtual Environment

It's highly recommended to use a virtual environment to manage project dependencies.

```bash
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

```

### 3. Install Dependencies
Install all required Python packages using the requirements.txt file:
```bash
pip install -r requirements.txt

```

### 4. Environment Variables (.env file)
Create a file named .env in the root directory of your project (the same directory as mains1.py, config.py, etc.). This file will store your sensitive API keys and database configurations.

```bash
# --- Agent MongoDB Configuration ---
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_Agent=reviews_db
MONGO_COLLECTION_Agent=agent_configs

# --- KB MongoDB Configuration ---
MONGO_DB_KB=knowledge_base_db
MONGO_COLLECTION_KB=kb_data

# --- PDF Based MongoDB Configuration ---
MONGO_DB_PDF=pdf_data_db
MONGO_COLLECTION_PDF=pdf_chunks

# --- MongoDB Configuration for Final Results ---
RESULTS_DB_NAME1=analysis_results_db
RESULTS_COLLECTION_NAM1=review_outcomes

# --- API Keys ---
GROQ_API_KEY1=your_groq_api_key_here # <<< IMPORTANT: Replace with your actual Groq API Key!


# --- Models ---
embeddings_model=BAAI/bge-large-en-v1.5
llm_groq=llama3-8b-8192
eval_llm1=meta-llama/llama-4-scout-17b-16e-instruct

```

### 5. MongoDB Setup

Ensure you have a MongoDB instance running, ideally locally on `mongodb://localhost:27017/`.
* **Download MongoDB:** [MongoDB Community Server](https://www.mongodb.com/try/download/community)
* **Install MongoDB Compass (GUI):** [MongoDB Compass](https://www.mongodb.com/products/compass) (Optional, but highly recommended for viewing your databases).

The system will automatically create the necessary databases and collections (`reviews_db`, `knowledge_base_db`, `pdf_data_db`, `analysis_results_db`) when you run the scripts.

### 6. Add Agent Data in MongoDB

**Add Review Agents (Initial Setup):**
To set up your initial review agents (like `NationalSecurityReview`, `InstitutionalIntegrityReview`, etc.), use the `Agent_dB_Mongo.py` script. This script contains predefined agent configurations that you can load into your database.

```bash
python Agent_dB_Mongo.py
```

### 7. Build Knowledge Base (Initial Setup)

**Build Knowledge Base (Initial Setup):**
To populate your knowledge base with official narratives and contextual information, use the `KB_Database_Mongo.py` script. This script facilitates inserting data into the `knowledge_base_db`.

```bash
python KB_Database_Mongo.py

```
 This script use `Knowledge_Base_New` folder so keep this folder in same path of script.

### 8. Prepare PDF Data

Place the PDF file you want to analyze (e.g., `The Lost War.pdf`) in the same root directory as your Python scripts. You can change the `PDF_FILE` variable in `MongoDatabase_for_pdf.py` if your file has a different name or path.


### 9. Populate Databases (Initial Run)

You'll need to populate the MongoDB collections with initial data for agents, knowledge base, and PDF chunks.

* **Process PDF into MongoDB:**
    ```bash
    python MongoDatabase_for_pdf.py
    ```
    This script reads your specified PDF, chunks it, and stores it in the `pdf_data_db`.

## 🏃 Running the System

After setting up all the prerequisites and populating the databases, you can run the main workflow:

```bash
python mains1.py

```

The system will:
* Clear previous analysis results.
* Load agents from MongoDB.
* Process PDF chunks.
* Classify text chunks.
* Route chunks through relevant review agents based on classification and agent criteria.
* Generate a final report for each chunk, including problematic text, observations, recommendations, confidence, retries, and human review necessity.
* Save all results to MongoDB.