# PostgreSQL Migration Guide for ai-services-3

## Overview

This guide walks you through migrating ai-services-3 from SQLite to PostgreSQL locally.

## Prerequisites

- PostgreSQL installed locally
- Python dependencies installed
- Existing SQLite database with data (optional)

## Step 1: Install PostgreSQL (if not already installed)

### Windows

**Option A: Official Installer**
1. Download from: https://www.postgresql.org/download/windows/
2. Run installer
3. Remember the password you set for `postgres` user
4. Default port: 5432

**Option B: Using Chocolatey**
```powershell
choco install postgresql
```

**Verify Installation:**
```powershell
psql --version
```

## Step 2: Create Database

Open PowerShell and connect to PostgreSQL:

```powershell
# Connect as postgres user
psql -U postgres

# In psql prompt, create database:
CREATE DATABASE chatbot_db;

# Optional: Create dedicated user
CREATE USER chatbot_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE chatbot_db TO chatbot_user;

# Exit psql
\q
```

## Step 3: Create Database Schema

Run the schema creation script:

```powershell
cd c:\Users\RishavShah\Desktop\Projects\chatbot\ai-services-3

# Using postgres user
psql -U postgres -d chatbot_db -f scripts\postgres_schema.sql

# Or using custom user
psql -U chatbot_user -d chatbot_db -f scripts\postgres_schema.sql
```

**Expected Output:**
```
DROP TABLE
DROP TABLE
CREATE TABLE
CREATE TABLE
CREATE INDEX
CREATE INDEX
...
COMMENT
```

## Step 4: Install Python Dependencies

```powershell
pip install psycopg2-binary python-dotenv
```

Or install all requirements:
```powershell
pip install -r requirements.txt
```

## Step 5: Configure Environment Variables

Create a `.env` file in the `ai-services-3` directory:

```powershell
# Copy the example file
copy .env.example .env

# Edit .env with your credentials
notepad .env
```

**Example `.env` file:**
```env
DB_TYPE=postgresql
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=chatbot_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password_here
```

## Step 6: Migrate Data (Optional)

If you have existing data in SQLite:

```powershell
python scripts\migrate_to_postgres.py
```

The script will:
1. Read data from SQLite (`data/data.db`)
2. Transform date formats
3. Insert into PostgreSQL
4. Verify row counts

**Note:** This will REPLACE all data in PostgreSQL tables.

## Step 7: Test the Connection

Start the service:

```powershell
python main.py
```

**Expected Output:**
```
✅ Database initialized: POSTGRESQL
✅ PostgreSQL connection pool created: chatbot_db@localhost
⚠️  faster_whisper not installed. Speech-to-text will be unavailable.
INFO:     Uvicorn running on http://127.0.0.1:8001
```

## Step 8: Verify Everything Works

Test with a simple query:

```powershell
# In another terminal
curl -X POST http://localhost:8001/chat -H "Content-Type: application/json" -d "{\"conversation_id\": \"test\", \"message\": \"Show me meter data\"}"
```

## Database Schema

### meter_users Table
```sql
CREATE TABLE meter_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    meter_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### meter_loads Table
```sql
CREATE TABLE meter_loads (
    id SERIAL PRIMARY KEY,
    meter_id INTEGER NOT NULL,
    date_time TIMESTAMP NOT NULL,
    forecasted_load DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Switching Between SQLite and PostgreSQL

You can easily switch between databases by changing the `.env` file:

**Use PostgreSQL:**
```env
DB_TYPE=postgresql
```

**Use SQLite (fallback):**
```env
DB_TYPE=sqlite
```

Restart the service after changing.

## Troubleshooting

### Connection Refused

**Problem:** `psycopg2.OperationalError: could not connect to server`

**Solution:**
1. Check PostgreSQL service is running:
   ```powershell
   Get-Service postgresql*
   ```
2. Start if stopped:
   ```powershell
   Start-Service postgresql-x64-14  # Version may vary
   ```

### Authentication Failed

**Problem:** `FATAL: password authentication failed`

**Solution:**
1. Verify credentials in `.env` file
2. Reset postgres password if needed:
   ```powershell
   psql -U postgres
   ALTER USER postgres PASSWORD 'new_password';
   ```

### Table Does Not Exist

**Problem:** `relation "meter_users" does not exist`

**Solution:**
Run the schema creation script again (Step 3)

### Module Not Found: psycopg2

**Problem:** `ModuleNotFoundError: No module named 'psycopg2'`

**Solution:**
```powershell
pip install psycopg2-binary
```

## Useful PostgreSQL Commands

```sql
-- Connect to database
\c chatbot_db

-- List all tables
\dt

-- Describe table structure
\d meter_users
\d meter_loads

-- View data
SELECT * FROM meter_users LIMIT 10;
SELECT * FROM meter_loads LIMIT 10;

-- Count rows
SELECT COUNT(*) FROM meter_users;
SELECT COUNT(*) FROM meter_loads;

-- Exit psql
\q
```

## Performance Tips

1. **Connection Pooling**: Already configured in `db_manager.py` (1-10 connections)
2. **Indexes**: Created automatically by schema script
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

## Backup and Restore

### Backup
```powershell
pg_dump -U postgres -d chatbot_db -f backup.sql
```

### Restore
```powershell
psql -U postgres -d chatbot_db -f backup.sql
```

## Next Steps

1. ✅ PostgreSQL is now your primary database
2. ✅ SQLite remains as fallback option
3. ✅ No changes needed in frontend/backend
4. ✅ Service automatically uses PostgreSQL

## Summary

Your ai-services-3 now supports:
- ✅ PostgreSQL with connection pooling
- ✅ SQLite fallback option
- ✅ Environment-based configuration
- ✅ Automatic table name handling (`meter_users`)
- ✅ Data migration from SQLite
- ✅ Production-ready database setup
