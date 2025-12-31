# 🚀 AI-Powered Conversational Analytics Platform

A full-stack enterprise-grade conversational analytics system that combines natural language processing, SQL generation, data visualization, and revenue forecasting into a seamless chat interface.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [System Requirements](#system-requirements)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

This platform enables users to interact with their data through natural language conversations. The AI understands queries, generates SQL, executes analytics, creates visualizations, and provides forecasting insights—all through a conversational interface.

**Key Capabilities:**
- Natural language to SQL query generation
- Real-time data visualization (charts & tables)
- Revenue forecasting with ML models
- Voice input via speech-to-text (Whisper)
- Role-based authentication with OTP
- Persistent chat history and conversation management
- Multi-intent understanding and context awareness

---

## 🏗 Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                      │
│                    (React + TypeScript)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API Layer                      │
│                   (Node.js + Express)                       │
│  ┌─────────────┬──────────────┬─────────────┬─────────────┐ │
│  │    Auth     │     Chat     │   Session   │   Storage   │ │
│  │   Service   │ Orchestrator │  Management │   Service   │ │
│  └─────────────┴──────────────┴─────────────┴─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       AI Service Layer                      │
│                     (Python + FastAPI)                      │
│  ┌─────────────┬──────────────┬─────────────┬─────────────┐ │
│  │    NLP      │     SQL      │ Forecasting │   Whisper   │ │
│  │  Engine     │  Generator   │   Models    │   STT       │ │
│  └─────────────┴──────────────┴─────────────┴─────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data & Storage Layer                     │
│                    PostgreSQL Database                      │
│  ┌──────────────────┬──────────────────┬─────────────────┐  │
│  │   User Data      │  Conversations   │  Analytics Data │  │
│  └──────────────────┴──────────────────┴─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User sends message (text/voice) → Frontend
2. Frontend → Backend (JWT authenticated)
3. Backend → AI Service (processes request)
4. AI Service → PostgreSQL (queries/stores data)
5. AI Service → Backend (structured response)
6. Backend → Frontend (formatted response)
7. Frontend renders (charts, tables, text)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **UI Library:** Mantine UI
- **State Management:** Redux Toolkit
- **HTTP Client:** Axios
- **Charting:** Chart.js
- **Build Tool:** Vite
- **Styling:** CSS Modules + Mantine Theme

### Backend
- **Runtime:** Node.js ≥ 18
- **Framework:** Express.js
- **Database:** PostgreSQL ≥ 13
- **Authentication:** JWT + OTP
- **Email:** Nodemailer
- **API Integration:** Axios
- **Environment:** dotenv

### AI Service
- **Framework:** FastAPI
- **ML/Analytics:** TensorFlow, Keras, Pandas, NumPy
- **NLP:** GROQ API integration
- **Speech-to-Text:** Faster-Whisper
- **Visualization:** Plotly
- **Database Driver:** psycopg2
- **Server:** Uvicorn

### Database
- **RDBMS:** PostgreSQL 13+
- **Schema:** Users, Conversations, Messages, Analytics

---

## ✨ Features

### 🤖 Conversational AI
- Natural language understanding with intent classification
- Context-aware multi-turn conversations
- Support for complex queries with multiple intents
- Real-time streaming responses
- Ability to cancel ongoing AI generation

### 📊 Data Analytics
- Natural language to SQL query generation
- Automatic data visualization (bar charts, line charts, pie charts)
- Tabular data rendering
- Data sanitization and validation
- Revenue forecasting with ML models

### 🎤 Voice Interaction
- Speech-to-text using Whisper model
- Real-time audio transcription
- Multi-language support

### 🔐 Authentication & Security
- OTP-based passwordless authentication
- JWT token-based sessions
- Automatic token refresh
- Secure API endpoints
- Protected routes

### 💬 Chat Management
- Create, rename, and delete conversations
- Persistent chat history
- Message search and filtering
- Export conversation data

### 🎨 User Experience
- Dark/light theme toggle
- Responsive mobile-first design
- Loading states and error handling
- Toast notifications
- Smooth animations

---

## 📂 Project Structure
```
project-root/
├── ai-service/               # AI/ML Service (Python)
│   ├── main.py              # FastAPI entry point
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   ├── models/              # ML models directory
│   ├── utils/               # Helper functions
│   └── README.md
│
├── backend/                 # Backend API (Node.js)
│   ├── server.js            # Express server
│   ├── package.json         # Node dependencies
│   ├── .env                 # Environment variables
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── conversations.js # Chat management
│   │   └── messages.js      # Message handling
│   ├── middleware/          # Auth & validation
│   ├── config/              # DB & app config
│   └── README.md
│
├── frontend/                # Frontend App (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store
│   │   ├── services/        # API services
│   │   ├── utils/           # Utility functions
│   │   ├── App.tsx          # Root component
│   │   └── main.tsx         # Entry point
│   ├── package.json         # Frontend dependencies
│   ├── .env                 # Environment variables
│   ├── vite.config.ts       # Vite configuration
│   └── README.md
│
├── .gitignore
└── README.md                # This file
```

---

## 💻 System Requirements

### Minimum Requirements
- **Node.js:** v18.0.0 or higher
- **Python:** v3.10 or higher
- **PostgreSQL:** v13.0 or higher
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 2GB free space
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+

### Optional
- **CUDA:** For GPU-accelerated ML models
- **Docker:** For containerized deployment
- **Redis:** For caching (future enhancement)

---

## 🚀 Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone <repository-url>
cd project-root
```

### 2️⃣ Database Setup
```bash
# Install PostgreSQL (if not installed)
# Create database
psql -U postgres
CREATE DATABASE chatdb;
\q
```

### 3️⃣ AI Service Setup
```bash
cd ai-service

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Configuration below)
# Start service
python main.py
```

**AI Service runs at:** `http://localhost:8001`

### 4️⃣ Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file (see Environment Configuration below)

# Run database migrations (if any)
npm run migrate

# Start development server
npm run dev
```

**Backend runs at:** `http://localhost:5000`

### 5️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file (see Environment Configuration below)

# Start development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## ⚙️ Environment Configuration

### AI Service `.env`
```env
# Database Configuration
POSTGRES_URL=postgresql://postgres:password@localhost:5432/chatdb

# API Configuration
HOST=0.0.0.0
PORT=8001

# ML Model Paths (optional)
MODEL_PATH=./models

# Logging
LOG_LEVEL=INFO
```

### Backend `.env`
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatdb
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AI Service
AI_SERVICE_URL=http://localhost:8001

# GROQ API (for NLP)
GROQ_API_KEY=your_groq_api_key_here

# CORS
CORS_ORIGIN=http://localhost:5173
```

### Frontend `.env`
```env
# API Configuration
VITE_API_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=AI Analytics Platform
VITE_APP_VERSION=1.0.0

# Feature Flags (optional)
VITE_ENABLE_VOICE=true
VITE_ENABLE_CHARTS=true
```

---

## 📡 API Documentation

### Authentication Endpoints

#### Send OTP
```http
POST /auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP sent successfully"
}
```

#### Verify OTP
```http
POST /auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### Conversation Endpoints

#### Get All Conversations
```http
GET /conversations
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "title": "Revenue Analysis",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:00:00Z"
  }
]
```

#### Create Conversation
```http
POST /conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Conversation"
}

Response: 201 Created
{
  "id": 2,
  "title": "New Conversation",
  "created_at": "2025-01-15T12:00:00Z"
}
```

#### Update Conversation
```http
PATCH /conversations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title"
}

Response: 200 OK
{
  "id": 1,
  "title": "Updated Title"
}
```

#### Delete Conversation
```http
DELETE /conversations/:id
Authorization: Bearer <token>

Response: 204 No Content
```

### Message Endpoints

#### Get Messages
```http
GET /messages/:conversationId
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": 1,
    "conversation_id": 1,
    "role": "user",
    "content": "Show me revenue trends",
    "created_at": "2025-01-15T10:30:00Z"
  },
  {
    "id": 2,
    "conversation_id": 1,
    "role": "assistant",
    "content": "Here's the revenue analysis...",
    "metadata": {
      "chart": {...},
      "sql": "SELECT ..."
    },
    "created_at": "2025-01-15T10:30:15Z"
  }
]
```

#### Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "conversation_id": 1,
  "content": "What's the total revenue?"
}

Response: 200 OK
{
  "id": 3,
  "role": "assistant",
  "content": "The total revenue is $1.2M",
  "metadata": {
    "chart": {...},
    "data": [...]
  }
}
```

### AI Service Endpoints

#### Chat
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Show revenue by product",
  "conversation_id": 1,
  "user_id": 1
}

Response: 200 OK
{
  "response": "Here's the revenue breakdown...",
  "chart": {...},
  "data": [...],
  "sql": "SELECT product, SUM(revenue)..."
}
```

#### Transcribe Audio
```http
POST /api/transcribe
Content-Type: multipart/form-data

file: <audio_file>

Response: 200 OK
{
  "transcription": "Show me the revenue trends"
}
```

#### Health Check
```http
GET /api/health

Response: 200 OK
{
  "status": "healthy",
  "timestamp": "2025-01-15T12:00:00Z"
}
```

#### Stop Generation
```http
POST /stop

Response: 200 OK
{
  "message": "Generation stopped"
}
```

---

## 🔒 Security

### Authentication Flow
1. User requests OTP via email
2. OTP sent to user's email (6-digit code)
3. User submits OTP for verification
4. Backend validates OTP and generates JWT
5. JWT stored in frontend (localStorage)
6. JWT included in all subsequent API requests
7. Backend validates JWT on protected routes
8. Token auto-refreshes before expiration

### Security Best Practices
- ✅ JWT tokens with expiration
- ✅ HTTP-only cookies option available
- ✅ CORS configured for specific origins
- ✅ SQL injection prevention
- ✅ Input validation and sanitization
- ✅ Rate limiting (recommended to add)
- ✅ HTTPS in production (recommended)
- ✅ Environment variables for secrets
- ✅ Password hashing (if using passwords)

---

## 📖 Usage

### Starting the Application

1. **Start all services in order:**
```bash
   # Terminal 1: AI Service
   cd ai-service && source .venv/bin/activate && python main.py
   
   # Terminal 2: Backend
   cd backend && npm run dev
   
   # Terminal 3: Frontend
   cd frontend && npm run dev
```

2. **Access the application:**
   - Open browser: `http://localhost:5173`
   - Login with email and OTP
   - Start chatting!

### Example Queries

**Data Analysis:**
- "Show me total revenue by product"
- "What are the top 5 customers by sales?"
- "Display monthly revenue trends"

**Forecasting:**
- "Forecast revenue for next quarter"
- "Predict sales for next 6 months"

**Visualization:**
- "Create a bar chart of revenue by region"
- "Show a pie chart of product distribution"

**Voice Input:**
- Click microphone icon
- Speak your query
- AI transcribes and processes

---

## 🐛 Troubleshooting

### Common Issues

**Issue: AI Service won't start**
```bash
# Check Python version
python --version  # Should be 3.10+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall

# Check PostgreSQL connection
psql -U postgres -d chatdb
```

**Issue: Backend connection refused**
```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Verify .env file exists and is correct
cat backend/.env

# Check database connection
npm run db:test
```

**Issue: Frontend won't connect to backend**
```bash
# Verify API URL in .env
cat frontend/.env

# Check CORS settings in backend
# Ensure CORS_ORIGIN matches frontend URL

# Clear browser cache and restart
```

**Issue: Database connection errors**
```sql
-- Check PostgreSQL is running
sudo service postgresql status

-- Verify database exists
psql -U postgres -l

-- Test connection
psql -U postgres -d chatdb -c "SELECT 1;"
```

**Issue: JWT token expired**
- Logout and login again
- Check JWT_EXPIRES_IN in backend .env
- Verify system clock is correct

**Issue: OTP not received**
- Check SMTP credentials in .env
- Verify email isn't in spam
- Check backend logs for email errors
- Test SMTP connection separately

---

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# AI Service tests
cd ai-service
pytest
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build
# Output in dist/

# Backend
cd backend
npm run build  # If using TypeScript

# AI Service
cd ai-service
pip install -r requirements.txt
# Use gunicorn or similar for production
```

### Database Migrations
```bash
cd backend
npm run migrate:create -- migration_name
npm run migrate:up
npm run migrate:down
```

---

## 🚀 Deployment

### Docker Deployment (Recommended)
```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. Set up PostgreSQL on server
2. Configure environment variables for production
3. Build frontend: `npm run build`
4. Deploy frontend to CDN/static hosting
5. Deploy backend to Node.js hosting (PM2, etc.)
6. Deploy AI service with Gunicorn/Uvicorn
7. Set up reverse proxy (Nginx)
8. Configure SSL certificates
9. Set up monitoring and logging

---

## 📈 Future Enhancements

### Planned Features
- [ ] WebSocket streaming for real-time responses
- [ ] Redis caching layer
- [ ] Multi-tenant support
- [ ] Advanced RBAC (Role-Based Access Control)
- [ ] Export conversations to PDF
- [ ] Scheduled reports
- [ ] Custom dashboard builder
- [ ] API rate limiting
- [ ] Audit logging
- [ ] Advanced analytics (A/B testing, user behavior)

### Optional Integrations
- [ ] Slack/Teams integration
- [ ] Google Sheets connector
- [ ] REST API for third-party apps
- [ ] Mobile app (React Native)
- [ ] Browser extension

---

## 🤝 Contributing

This is an internal project. For contributions:

1. Create a feature branch
2. Make changes with clear commit messages
3. Test thoroughly
4. Submit pull request
5. Wait for code review

---

## 👨‍💻 Maintainer

**Rishav Shah**  
Full-Stack & AI Engineer  

For questions or support, contact the development team.

---

## 📄 License

**Internal / Proprietary**

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

Copyright © 2025. All rights reserved.

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Mantine UI](https://mantine.dev/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

---

**Last Updated:** December 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready