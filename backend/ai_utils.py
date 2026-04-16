import requests
import json
import numpy as np
import re
from collections import Counter

import os

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/api")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "embeddinggemma:latest")
GENERATION_MODEL = os.getenv("GENERATION_MODEL", "gemma3:4b")

CIVIC_STOPWORDS = {
    "the", "and", "town", "apex", "spark", "idea", "we", "what", "if", "for", "with", "from", "that", "this", "these", "those", 
    "into", "onto", "upon", "about", "above", "across", "after", "against", "along", "among", "around", "at", "before", 
    "behind", "below", "beside", "between", "beyond", "but", "by", "concerning", "despite", "down", "during", "except", 
    "following", "for", "from", "in", "including", "into", "like", "near", "of", "off", "on", "onto", "out", "over", 
    "past", "plus", "since", "through", "throughout", "to", "towards", "under", "until", "up", "upon", "upto", "via", 
    "with", "within", "without", "should", "could", "would", "shall", "will", "can", "may", "might", "must", "very",
    "really", "just", "only", "also", "now", "then", "there", "here", "when", "where", "why", "how", "all", "any", 
    "both", "each", "few", "more", "most", "other", "some", "such", "than", "too", "very", "can", "will", "just", "dont"
}

def get_embedding(text: str):
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/embeddings",
            json={
                "model": EMBEDDING_MODEL,
                "prompt": text
            }
        )
        response.raise_for_status()
        return response.json()["embedding"]
    except Exception as e:
        print(f"Error fetching embedding from Ollama: {e}")
        return None

def cosine_similarity(v1, v2):
    if v1 is None or v2 is None:
        return 0.0
    a = np.array(v1)
    b = np.array(v2)
    if a.shape != b.shape:
        return 0.0
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot_product / (norm_a * norm_b))

def analyze_spark_metadata(text: str, fields: list):
    """
    Analyzes spark text using Ollama to extract metadata based on dynamic field definitions.
    """
    if not fields:
        return {}
    
    field_descriptions = "\n".join([
        f"- {f['label']} ({f['field_type']}): {f['description']}" + 
        (f" (Options: {f['options']})" if f['options'] else "")
        for f in fields
    ])

    prompt = f"""
    Analyze the following town staff idea "Spark" and provide values for the requested metadata fields.
    
    SPARK TEXT: "{text}"
    
    METADATA FIELDS TO POPULATE:
    {field_descriptions}
    
    INSTRUCTIONS:
    1. Provide values for EVERY field listed above.
    2. For 'numeric' fields, provide a single float or integer from 0 to 10.
    3. For 'categorical' fields, pick the most appropriate option from the provided list.
    4. Return ONLY a valid JSON object where keys are the Field Labels exactly as written.
    5. Do not include any explanation, preamble, or markdown formatting outside the JSON.
    """

    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/generate",
            json={
                "model": GENERATION_MODEL,
                "prompt": prompt,
                "format": "json",
                "stream": False
            }
        )
        response.raise_for_status()
        result = response.json()["response"]
        return json.loads(result)
    except Exception as e:
        print(f"Error analyzing metadata: {e}")
        return {}

def get_word_frequencies(texts: list):
    """
    Returns a list of word frequency pairs, filtered by civic stopwords.
    """
    all_text = " ".join(texts).lower()
    # Remove special chars but keep words
    words = re.findall(r'\b\w{3,}\b', all_text)
    
    filtered_words = [w for w in words if w not in CIVIC_STOPWORDS]
    counts = Counter(filtered_words)
    
    # Return as list of dicts for frontend { text: 'value', value: 10 }
    return [{"text": word, "value": count} for word, count in counts.most_common(50)]

def generate_suggestion(prompt: str):
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/generate",
            json={"model": GENERATION_MODEL, "prompt": prompt, "stream": False}
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        print(f"Error generating text from Ollama: {e}")
        return None
