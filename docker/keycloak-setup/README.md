# Keycloak Setup Guide

## Quick Start

### 1. Start the Instances
Navigate to this directory and run:
```bash
docker-compose up -d
```
> [!TIP]
> Use `docker-compose ps` to verify that both `keycloak` and `keycloak-postgres` are "Up" and "Healthy".

### 2. Access Admin Console
- **URL**: [http://localhost:8080](http://localhost:8080)
- **Username**: `admin`
- **Password**: `admin`

### 3. Essential Docker Commands
- **View Logs**: `docker-compose logs -f keycloak`
- **Stop Containers**: `docker-compose stop`
- **Start Again**: `docker-compose start`
- **Remove Containers**: `docker-compose down` (Add `-v` to also delete database volumes)

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

## Data Import & Export

### Option 1: Importing a Realm JSON (Recommended)
If you have a `realm-export.json` file, you can import it to quickly set up all roles, clients, and configurations.

1.  **Via Admin Console**:
    *   Log in to http://localhost:8080 (admin/admin).
    *   Click on the **Master** realm dropdown → **Create Realm**.
    *   Click **Browse** for the "Resource File" and select your `.json` export.
    *   Click **Create**.

2.  **Via Docker (Auto-Import on Start)**:
    *   Place your JSON file in the `keycloak-setup` directory.
    *   Update `docker-compose.yml` to mount the file:
        ```yaml
        volumes:
          - ./realm-export.json:/opt/keycloak/data/import/realm.json
        ```
    *   Add the import command to the `keycloak` service:
        ```yaml
        command: start-dev --import-realm
        ```

### Option 2: Database Snapshot (PostgreSQL)
Since Keycloak data is stored in the `postgres` container, you can import/export the entire DB state.

1.  **Export Data**:
    ```bash
    docker exec keycloak-postgres pg_dump -U keycloak keycloak > backup.sql
    ```

2.  **Import SQL File (Manual)**:
    *   **Step 1**: Copy the SQL file into the container:
        ```bash
        docker cp keycloak-setup\keycloak_backup.sql keycloak-postgres:/tmp/import.sql
        ```
    *   **Step 2**: Execute the import command:
        ```bash
        docker exec -it keycloak-postgres psql -U keycloak -d keycloak -f /tmp/import.sql
        ```

3.  **Import SQL File (Automated - First Run Only)**:
    *   Create an `init-db` folder in this directory.
    *   Place your SQL file inside `init-db/`.
    *   Modify [docker-compose.yml](file:///c:/Users/RishavShah/Desktop/Projects/chatbot/keycloak-setup/docker-compose.yml) to include the volume:
        ```yaml
        volumes:
          - ./init-db:/docker-entrypoint-initdb.d
        ```
    *   > [!IMPORTANT]
        > This only works if the Postgres volume is empty (first initialization).

---

## Troubleshooting

### Keycloak not starting
- Check logs: `docker-compose logs keycloak`
- Ensure PostgreSQL is healthy: `docker-compose ps`

### Cannot access admin console
- Wait 1-2 minutes for Keycloak to fully start. It often takes longer on the first run as it initializes the database schema.
- Check health: `curl http://localhost:8080/health/ready`

### Port 8080 already in use
- Change the host port mapping in `docker-compose.yml`:
  ```yaml
  ports:
    - "8081:8080" # Change left side to any free port
  ```
- Update all `.env` URLs to use `8081`. 
