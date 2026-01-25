# Backend Service

This is the Node.js/Express backend for the Chatbot application. It handles API requests, database interactions, and authentication via Keycloak.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **PostgreSQL** (Database)
- **Keycloak** (Authentication Server)

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Copy `.env.example` to `.env` and update the values:
    ```bash
    cp .env.example .env
    ```
    Required variables:
    -   Database (`DB_HOST`, `DB_PORT`, etc.)
    -   Server (`PORT`)
    -   Keycloak (`KEYCLOAK_SERVER_URL`, `REALM`, `CLIENT_ID`, `CLIENT_SECRET`)
    -   AI Service URL (`AI_SERVICE_URL`)

3.  **Database Setup:**
    Ensure your PostgreSQL database `chatbot` exists. You may need to run initialization scripts located in the `database/` folder (root of the repo) if this is a fresh install.

## Running the Application

### Development
Run with `nodemon` for hot-reloading:
```bash
npm run dev
```
The server will start on the port specified in `.env` (default: 5000).

### Production
Build and start the server:
```bash
npm run build
npm start
```
