# Keycloak Setup Guide

## Quick Start

1. **Start Keycloak**:
   ```bash
   cd keycloak-setup
   docker-compose up -d
   ```

2. **Access Keycloak Admin Console**:
   - URL: http://localhost:8080
   - Username: `admin`
   - Password: `admin`

3. **Configure Realm and Client** (see below)

---

## Realm Configuration

### 1. Create Realm

1. Click **Master** dropdown (top-left) → **Create Realm**
2. **Realm name**: `chatbot_keycloak_integration
`
3. Click **Create**

### 2. Create Client

1. Navigate to **Clients** → **Create client**
2. **Client ID**: `test_client`
3. **Client type**: `OpenID Connect`
4. Click **Next**
5. **Client authentication**: `ON` (confidential)
6. **Authorization**: `OFF`
7. **Authentication flow**: Enable `Standard flow` and `Direct access grants`
8. Click **Next**
9. **Valid redirect URIs**: 
   - `http://localhost:5173/*`
   - `http://localhost:3000/*`
10. **Web origins**: 
    - `http://localhost:5173`
    - `http://localhost:3000`
11. Click **Save**

### 3. Get Client Secret

1. Go to **Clients** → **test_client** → **Credentials** tab
2. Copy the **Client secret** (you'll need this for backend `.env`)

### 4. Create Roles

1. Navigate to **Realm roles** → **Create role**
2. Create two roles:
   - **Role name**: `admin`
   - **Role name**: `employee`

### 5. Create Test Users

#### Admin User
1. Navigate to **Users** → **Add user**
2. **Username**: `admin@test.com`
3. **Email**: `admin@test.com`
4. **Email verified**: `ON`
5. Click **Create**
6. Go to **Credentials** tab → **Set password**
   - Password: `admin123`
   - Temporary: `OFF`
7. Go to **Role mapping** tab → **Assign role**
   - Select `admin` role

#### Employee User
1. Navigate to **Users** → **Add user**
2. **Username**: `employee@test.com`
3. **Email**: `employee@test.com`
4. **Email verified**: `ON`
5. Click **Create**
6. Go to **Credentials** tab → **Set password**
   - Password: `employee123`
   - Temporary: `OFF`
7. Go to **Role mapping** tab → **Assign role**
   - Select `employee` role

---

## Environment Variables

After completing the setup, update your `.env` files:

### Backend `.env`
```
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=chatbot_keycloak_integration

KEYCLOAK_CLIENT_ID=test_client
KEYCLOAK_CLIENT_SECRET=<paste-client-secret-here>
```

### Frontend `.env`
```
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=chatbot_keycloak_integration

VITE_KEYCLOAK_CLIENT_ID=test_client
```

---

## Troubleshooting

### Keycloak not starting
- Check logs: `docker-compose logs keycloak`
- Ensure PostgreSQL is healthy: `docker-compose ps`

### Cannot access admin console
- Wait 1-2 minutes for Keycloak to fully start
- Check health: `curl http://localhost:8080/health/ready`

### Port 8080 already in use
- Change port in `docker-compose.yml`: `"8081:8080"`
- Update all URLs accordingly
