import os
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# Load embedding model once
EMB_MODEL = SentenceTransformer("all-MiniLM-L6-v2")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAG_DIR = os.path.join(BASE_DIR, "rag")
RAG_INDEX_PATH = os.path.join(BASE_DIR, "rag_index.npz")

RAG_INDEX = None


def build_rag_index():
    """
    Reads all .txt files inside /rag directory,
    embeds them, and saves rag_index.npz
    """
    docs = []
    file_list = []

    # Read all RAG text files
    for fname in os.listdir(RAG_DIR):
        if fname.endswith(".txt"):
            fpath = os.path.join(RAG_DIR, fname)
            with open(fpath, "r", encoding="utf-8") as f:
                text = f.read().strip()
                docs.append(text)
                file_list.append(fname)

    if not docs:
        raise ValueError("No .txt RAG files found in /rag folder!")

    print(f"Found {len(docs)} RAG documents → building embeddings...")

    vectors = EMB_MODEL.encode(docs, show_progress_bar=True)
    vectors = np.array(vectors)

    # Save to NPZ
    np.savez(RAG_INDEX_PATH, vectors=vectors, chunks=np.array(docs), files=np.array(file_list))

    print("RAG index successfully created → rag_index.npz")


def load_rag_index():
    """
    Load index into memory (lazy load).
    """
    global RAG_INDEX

    if RAG_INDEX is None:
        if not os.path.exists(RAG_INDEX_PATH):
            raise FileNotFoundError(
                "rag_index.npz NOT FOUND. Run build_rag_index() to create it."
            )
        RAG_INDEX = np.load(RAG_INDEX_PATH, allow_pickle=True)

    return RAG_INDEX


def embed_query(text: str):
    """Embed user query."""
    vec = EMB_MODEL.encode([text], show_progress_bar=False)
    return np.array(vec)


def retrieve_relevant_chunks(query: str, top_k: int = 5):
    """
    Returns top-K most relevant RAG chunks using cosine similarity.
    """
    index = load_rag_index()
    vectors = index["vectors"]
    chunks = index["chunks"]

    q_vec = embed_query(query)
    sims = cosine_similarity(q_vec, vectors)[0]

    top_idx = np.argsort(sims)[::-1][:top_k]

    return [chunks[i] for i in top_idx]
