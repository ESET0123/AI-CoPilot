# Esyasoft AI CoPilot

A full-stack conversational AI chatbot with revenue forecasting capabilities, built with React, Node.js/Express, Python/FastAPI, and PostgreSQL.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup (Node.js/Express)](#2-backend-setup-nodejsexpress)
  - [3. AI Services Setup (Python/FastAPI)](#3-ai-services-setup-pythonfastapi)
  - [4. Frontend Setup (React)](#4-frontend-setup-react)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

- **Email OTP Authentication** - Secure login with one-time passwords
- **Conversational AI Chat** - Natural language interface powered by LLM
- **Revenue Forecasting** - ML-based revenue predictions using TensorFlow
- **SQL Query Generation** - Natural language to SQL conversion
- **Multi-conversation Management** - Create, rename, delete chat sessions
- **Real-time Chat** - Instant messaging with loading indicators
- **Dark/Light Theme** - Toggle between color schemes
- **Responsive Design** - Works on desktop and mobile

---

## 🏗 Architecture
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Frontend  │────▶ │   Backend   │────▶ │ AI Services │
│   (React)   │      │  (Express)  │      │  (FastAPI)  │
└─────────────┘      └─────────────┘      └─────────────┘
                            │                     │
                            ▼                     ▼
                     ┌─────────────┐      ┌─────────────┐
                     │ PostgreSQL  │      │   Ollama    │
                     │  Database   │      │  (LLM API)  │
                     └─────────────┘      └─────────────┘
```

---

## 🔧 Prerequisites

Ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.9 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/)
- **Ollama** - [Download](https://ollama.ai/) (for local LLM)
- **Git** - [Download](https://git-scm.com/)

---

## 📁 Project Structure
```
chatbot/
├── frontend/               # React frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Express backend
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── ai-services/           # Python AI services
    ├── app/
    ├── models/
    ├── requirements.txt
    └── main.py
```

---

## 🚀 Installation & Setup

### 1. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE chatbot_db;

# Exit
\q
```

#### Create Tables
```sql
-- Connect to the database
\c chatbot_db

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email OTPs table
CREATE TABLE email_otps (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meter loads table (for forecasting)
CREATE TABLE meter_loads (
    id SERIAL PRIMARY KEY,
    meter_id INTEGER,
    date_time TIMESTAMP NOT NULL,
    forecasted_load NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_meter_loads_date_time ON meter_loads(date_time);
```

---

### 2. Backend Setup (Node.js/Express)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatbot_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# SMTP (for OTP emails - use Gmail or any SMTP service)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM=your_email@gmail.com

# Groq API (optional - if using Groq)
GROQ_API_KEY=your_groq_api_key
EOF

# Build TypeScript
npm run build

# Run in development mode
npm run dev
```

#### Gmail SMTP Setup (for OTP emails)

1. Enable 2-factor authentication in your Google account
2. Generate an App Password: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the generated password in `SMTP_PASS`

---

### 3. AI Services Setup (Python/FastAPI)
```bash
# Navigate to ai-services directory
cd ai-services

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Create `requirements.txt`
```txt
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
psycopg2-binary==2.9.9
pandas==2.1.4
numpy==1.26.3
tensorflow==2.15.0
scikit-learn==1.4.0
joblib==1.3.2
requests==2.31.0
```

#### Install Ollama and Pull Model
```bash
# Install Ollama from https://ollama.ai/

# Pull the model (gemma3:1b)
ollama pull gemma3:1b

# Verify it's running (should be on http://localhost:11434)
curl http://localhost:11434/api/tags
```

#### Train the Revenue Model (Optional)

If you have training data, create a training script:
```python
# train_model.py
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from tensorflow import keras
import joblib

# Load your training data
# df = pd.read_csv('revenue_data.csv')
# Features: total_load, month, weekday
# Target: revenue

# Example training code:
# X = df[['total_load', 'month', 'weekday']].values
# y = df['revenue'].values

# scaler_X = StandardScaler()
# scaler_y = StandardScaler()

# X_scaled = scaler_X.fit_transform(X)
# y_scaled = scaler_y.fit_transform(y.reshape(-1, 1))

# model = keras.Sequential([
#     keras.layers.Dense(64, activation='relu', input_shape=(3,)),
#     keras.layers.Dense(32, activation='relu'),
#     keras.layers.Dense(1)
# ])

# model.compile(optimizer='adam', loss='mse')
# model.fit(X_scaled, y_scaled, epochs=100, batch_size=32)

# # Save
# os.makedirs('models', exist_ok=True)
# model.save('models/revenue_model.keras')
# joblib.dump({
#     'input_scaler': scaler_X,
#     'output_scaler': scaler_y
# }, 'models/revenue_scalers.pkl')
```

#### Run AI Services
```bash
# From ai-services directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

---

### 4. Frontend Setup (React)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000
EOF

# Run development server
npm run dev
```

---

## 🎯 Running the Application

Start all services in separate terminals:

### Terminal 1: Backend
```bash
cd backend
npm run dev
```

**Backend runs on:** http://localhost:5000

### Terminal 2: AI Services
```bash
cd ai-services
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn app.main:app --reload --port 8001
```

**AI Services run on:** http://localhost:8001

### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

**Frontend runs on:** http://localhost:5173

### Verify Ollama is Running
```bash
ollama serve
```

**Ollama API:** http://localhost:11434

---

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `chatbot_db` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `rishav123` |
| `JWT_SECRET` | JWT signing key | `your_secret_key` |
| `SMTP_HOST` | SMTP server | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `your@email.com` |
| `SMTP_PASS` | SMTP password | `app_password` |
| `MAIL_FROM` | Email sender | `your@email.com` |

### AI Services (app/config.py)
```python
OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "gemma3:1b"
POSTGRES_URL = "postgresql://postgres:rishav123@localhost:5432/chatbot_db"
```

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

---

## 📚 API Documentation

### Authentication

**POST** `/auth/send-otp`
```json
{
  "email": "user@example.com"
}
```

**POST** `/auth/verify-otp`
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Conversations

**GET** `/conversations` - Get all user conversations  
**POST** `/conversations` - Create new conversation  
**PATCH** `/conversations/:id` - Rename conversation  
**DELETE** `/conversations/:id` - Delete conversation  
**DELETE** `/conversations` - Delete all conversations  

### Messages

**GET** `/messages/:conversationId` - Get conversation messages  
**POST** `/messages` - Send message
```json
{
  "conversationId": "uuid",
  "message": "What is the revenue forecast for tomorrow?"
}
```

### AI Services

**POST** `/chat` - Process chat message
```json
{
  "conversation_id": "uuid",
  "message": "Predict revenue for 2025-12-25"
}
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Check PostgreSQL connection:**
```bash
psql -U postgres -d chatbot_db -c "SELECT 1"
```

**Verify environment variables:**
```bash
cat backend/.env
```

### Issue: AI Services error

**Check Ollama is running:**
```bash
curl http://localhost:11434/api/tags
```

**Verify Python dependencies:**
```bash
pip list | grep fastapi
```

### Issue: Frontend can't connect

**Check backend is running:**
```bash
curl http://localhost:5000/health/db
```

**Verify VITE_API_URL:**
```bash
cat frontend/.env
```

### Issue: OTP emails not sending

- Check SMTP credentials in backend `.env`
- For Gmail, ensure App Password is used (not account password)
- Check spam folder

### Issue: Revenue model not found

- Ensure `models/revenue_model.keras` exists
- Train the model using your data or create dummy model files

---

## 🧪 Testing

### Health Checks
```bash
# Backend
curl http://localhost:5000/health/db

# AI Services
curl http://localhost:8001/health/db
```

### Sample Chat Queries

- "What is the load for meter 1 on 2025-12-25?"
- "Predict revenue for tomorrow"
- "Show me forecasted load for today"

---

## 📦 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Output in frontend/dist
```

### Build Backend
```bash
cd backend
npm run build
# Output in backend/dist
```

### Environment Variables

Update all `.env` files with production values:
- Database connection strings
- API URLs (use domain names instead of localhost)
- Secure JWT secrets
- Production SMTP credentials

---

## 📄 License

This project is proprietary software developed for Esyasoft.

---

## 👥 Contributors

- **Rishav Shah** - Full Stack Development

---

## 📞 Support

For issues or questions, contact: rishav@esyasoft.com

---

**Happy Coding! 🚀**