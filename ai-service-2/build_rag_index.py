# import os
# import json
# import numpy as np
# from sklearn.preprocessing import normalize
# import subprocess
# import shutil

# RAG_DIR = "rag"
# OUTFILE = "rag_index.npz"
# EMBED_MODEL = "nomic-embed-text"

# # -------------------------------------------------------------------
# # 1. Read files & chunk text
# # -------------------------------------------------------------------
# def load_chunks():
#     chunks = []
#     ids = []

#     for fname in os.listdir(RAG_DIR):
#         path = os.path.join(RAG_DIR, fname)
#         if not os.path.isfile(path):
#             continue

#         with open(path, "r", encoding="utf-8", errors="ignore") as f:
#             text = f.read()

#         # split into smaller chunks
#         parts = text.split("\n\n")
#         for p in parts:
#             clean = p.strip()
#             if len(clean) > 20:
#                 chunks.append(clean)
#                 ids.append(fname)

#     print(f"Collected {len(chunks)} chunks from {len(os.listdir(RAG_DIR))} files.")
#     return chunks, ids


# # -------------------------------------------------------------------
# # 2. Create embeddings using Ollama (CORRECT COMMAND)
# # -------------------------------------------------------------------
# def embed_texts(text_list):
#     payload = {
#         "model": EMBED_MODEL,
#         "input": text_list
#     }

#     result = subprocess.run(
#         ["ollama", "embed"],
#         input=json.dumps(payload),
#         text=True,
#         capture_output=True
#     )

#     # Fail early if Ollama binary isn't available
#     if not shutil.which("ollama"):
#         raise RuntimeError("'ollama' CLI not found in PATH. Install Ollama and ensure it's on your PATH.")

#     # Check process exit status and include stderr for debugging
#     if result.returncode != 0:
#         # If Ollama doesn't support an `embed` subcommand, fall back to a local embedding model
#         stderr_lower = (result.stderr or "").lower()
#         if "unknown command" in stderr_lower and "embed" in stderr_lower:
#             print("Ollama CLI does not support 'embed' — falling back to sentence-transformers locally.")
#             try:
#                 from sentence_transformers import SentenceTransformer
#             except Exception:
#                 raise RuntimeError(
#                     "Ollama embed command is unavailable and 'sentence-transformers' is not installed. "
#                     "Install it with: pip install sentence-transformers"
#                 )

#             try:
#                 s_model = SentenceTransformer("all-MiniLM-L6-v2")
#                 vecs = s_model.encode(text_list, show_progress_bar=False)
#                 return np.array(vecs)
#             except Exception as e:
#                 raise RuntimeError(f"Local SentenceTransformer embedding failed: {e}")

#         raise RuntimeError(
#             f"Ollama embed command failed (returncode={result.returncode}).\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
#         )

#     # If stdout is empty, include stderr for diagnosis
#     if not result.stdout or not result.stdout.strip():
#         raise RuntimeError(
#             f"Empty output from Ollama embed command.\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
#         )

#     try:
#         resp = json.loads(result.stdout)
#     except Exception as e:
#         raise RuntimeError(
#             f"Failed to parse Ollama JSON output: {e}\nSTDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
#         )

#     if "embeddings" not in resp:
#         raise RuntimeError(f"Missing 'embeddings' key from Ollama response:\n{resp}")

#     vecs = [e["embedding"] for e in resp["embeddings"]]
#     return np.array(vecs)


# # -------------------------------------------------------------------
# # 3. Build and save index
# # -------------------------------------------------------------------
# def main():
#     chunks, ids = load_chunks()
#     batch_size = 16

#     all_vecs = []

#     for start in range(0, len(chunks), batch_size):
#         end = start + batch_size
#         batch = chunks[start:end]

#         print(f"Embedding batch {start}-{end-1} ...")

#         vectors = embed_texts(batch)

#         if vectors.shape[1] == 0:
#             raise RuntimeError("Embedding vectors are empty (0 dims). Something is wrong.")

#         all_vecs.append(vectors)

#     vectors = np.vstack(all_vecs)

#     # normalize for cosine similarity
#     vectors = normalize(vectors, axis=1)

#     print(f"Saving index to {OUTFILE} ...")
#     np.savez(
#         OUTFILE,
#         vectors=vectors,
#         chunks=np.array(chunks, dtype=object),
#         ids=np.array(ids, dtype=object)
#     )

#     print("✅ RAG index built successfully!")


# if __name__ == "__main__":
#     main()


import os
import numpy as np
from sklearn.preprocessing import normalize
from sentence_transformers import SentenceTransformer

RAG_DIR = "rag"
OUTFILE = "rag_index.npz"

EMB_MODEL = SentenceTransformer("all-MiniLM-L6-v2")


def load_chunks():
    chunks = []
    ids = []

    for fname in os.listdir(RAG_DIR):
        path = os.path.join(RAG_DIR, fname)
        if not os.path.isfile(path):
            continue

        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()

        parts = text.split("\n\n")
        for p in parts:
            clean = p.strip()
            if len(clean) > 20:
                chunks.append(clean)
                ids.append(fname)

    print(f"Collected {len(chunks)} chunks from RAG files.")
    return chunks, ids


def main():
    chunks, ids = load_chunks()

    print("Embedding chunks with SentenceTransformers...")
    vectors = EMB_MODEL.encode(chunks, batch_size=16, show_progress_bar=True)

    vectors = normalize(vectors, axis=1)

    np.savez(
        OUTFILE,
        vectors=vectors,
        chunks=np.array(chunks, dtype=object),
        ids=np.array(ids, dtype=object)
    )

    print("✅ RAG index built successfully!")


if __name__ == "__main__":
    main()

