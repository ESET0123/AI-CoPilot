⚡ LoadForecast AI — Intelligent Energy Analytics Platform

LoadForecast AI is a full-stack, role-based analytics platform for electricity load forecasting, anomaly detection, and revenue prediction, built using FastAPI, Machine Learning models, SQLite, and a modern chat-style UI.

The system combines rule-based intent detection, ML models, SQL analytics, and optional LLM-RAG fallback, making it both fast and intelligent.

🚀 Key Features
🔮 Meter Load Forecasting

Short-term load forecasting for smart meters (15-minute resolution)

ML models trained per meter (forecast_<MTR>.pkl)

Supports queries like:

“Forecast MTR001 for next 24 hours”

“Predict load for MTR002 tomorrow”

📊 Advanced Analytics

Correlation analysis (temperature, humidity vs load)

Seasonal and monthly trends

Anomaly detection (z-score based)

Peak cause analysis (weather influence)

Billing estimation

💰 Revenue Forecasting (Admin-Only)

Year-wise and range-based revenue prediction

Linear Regression model trained on historical revenue data

Supports:

“Estimate revenue for 2030”

“Revenue forecast from 2025 to 2040”

🔐 Role-Based Access Control

Admin

Full access: meter analytics + revenue forecasting

Employee

Meter analytics only

Enforced at:

Backend (FastAPI middleware)

Frontend UI (query blocking + UX feedback)

🧠 Intelligent Query Routing

Hybrid decision pipeline:

Rule-based intent detection (fast & deterministic)

Safe SQL templates for known queries

Analytics engine for Python-based analysis

RAG + LLM fallback (DeepSeek via Ollama) for open-ended queries

This ensures low latency for known queries and AI flexibility when needed.

🖥️ Modern Chatbot UI

Chat-style interface with history & suggestions

Dynamic charts (Chart.js)

SQL preview panel

Login screen with role awareness

Voice input support

Dark / Light mode

🏗️ Tech Stack

Backend

FastAPI

SQLite

Pandas, NumPy

Scikit-learn

Joblib

Optional LLM (DeepSeek via Ollama)

RAG with Sentence Transformers

Frontend

Vanilla HTML / CSS / JS

Chart.js

Responsive UI

LocalStorage session handling

🧠 System Architecture (High-Level)
User Query
   ↓
Intent Detection (Rule-Based)
   ↓
├── Forecast Engine (ML)
├── Analytics Engine (Python)
├── SQL Template Engine (Safe SQL)
└── RAG + LLM (Fallback only)

🎯 Why This Project Matters (Job-Ready Value)

This project demonstrates real-world engineering skills, not just ML training:

✔ End-to-end system design
✔ Clean API architecture
✔ Role-based security
✔ Hybrid AI + deterministic logic
✔ Performance-aware design (LLM used only when needed)
✔ Production-style error handling

This is highly relevant for roles like:

Data Scientist

ML Engineer

Backend Engineer

AI / Analytics Engineer

Energy / Utility Domain Roles