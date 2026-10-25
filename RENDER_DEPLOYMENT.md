# 🚀 Deploying Directly onto Render (100% Render Native)

This guide explains how to deploy the entire **Banking Management System DBMS Project** directly onto [Render](https://render.com) using **only Render services** — no outside database providers, no outside frontend hosts, and no third-party tools.

---

## 🏗️ Architecture on Render

```
                                  [ Render Cloud ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         [ banking-frontend ]                            [ banking-backend ]
         Render Static Site                              Render Web Service
       (React 18 + Vite SPA)                         (Spring Boot 3 + Java 21)
                  │                                               │
                  └─────────────── HTTPS / REST API ──────────────┘
                                          │
                                          ▼
                                   [ banking-mysql ]
                                Render Private Service
                                  (MySQL 8.0 Server)
```

We provide **two primary ways** to deploy on Render:
1. **Method 1: Render Blueprint (`render.yaml`)** — Modular 3-service deployment (MySQL Private Service + Backend Web Service + Frontend Static Site).
2. **Method 2: Render Free-Tier All-in-One Container (`Dockerfile.render`)** — Single Web Service that packages MySQL + Backend + Frontend together for **100% free hosting with $0 cost**.

---

## ⚡ Method 1: 1-Click Render Blueprint (Recommended)

Render Blueprints automatically provision and connect all services using the `render.yaml` file in this repository.

### Step 1: Push Changes to GitHub
Make sure your latest code with `render.yaml`, `Dockerfile.mysql`, and updated `Dockerfile` is pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure 100% Render-native deployment"
git push origin main
```

### Step 2: Create Blueprint on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. In the top-right corner, click **New +** and select **Blueprint**.
3. Connect your GitHub account and select your repository: `Banking-Management-System-Dbms-Project`.
4. Render will automatically detect the [`render.yaml`](file:///C:/Users/aadar/OneDrive/Documents/Desktop/DBMS_Project/Banking-Management-System-Dbms-Project-main/render.yaml) file.
5. Click **Apply**.

Render will automatically provision:
- 🗄️ **`banking-mysql`** (Private Service): Builds MySQL 8 and automatically runs all 3 SQL scripts (`01_schema.sql`, `02_indexes_views_procedures.sql`, `03_seed_data.sql`).
- ☕ **`banking-backend`** (Web Service): Builds Java 21 Spring Boot JAR and links to `banking-mysql` via internal network.
- ⚛️ **`banking-frontend`** (Static Site): Builds React with Vite, publishes static files to global CDN, and configures SPA rewrite rules.

---

## 🆓 Method 2: 100% Free Tier All-In-One Container

On Render's Free Plan, private services and persistent disks are not included. If you want to run the full application **completely free** on Render:

Use [`Dockerfile.render`](file:///C:/Users/aadar/OneDrive/Documents/Desktop/DBMS_Project/Banking-Management-System-Dbms-Project-main/Dockerfile.render), which packages MariaDB (MySQL-compatible) + Java 21 Spring Boot + Vite React SPA in a single container.

### Steps:
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following fields:
   - **Name**: `banking-management-system`
   - **Region**: Choose the region closest to you (e.g., *Oregon*, *Frankfurt*, *Singapore*).
   - **Language / Runtime**: **Docker**
   - **Dockerfile Path**: `Dockerfile.render`
   - **Instance Type**: **Free**
4. Click **Create Web Service**.

Render will build the container, start the database with seed data, launch Spring Boot on port 8081, and serve both the React UI and API via Nginx on Render's assigned port!

---

## 🛠️ Method 3: Manual Service-by-Service Setup on Render

If you prefer to configure each service manually in the Render web dashboard:

### 1. Database (`banking-mysql`)
1. Click **New +** -> **Private Service** (or Web Service).
2. Connect repository.
3. Set **Runtime**: **Docker**.
4. Set **Dockerfile Path**: `Dockerfile.mysql`.
5. Under **Disks**, add:
   - Name: `mysql-data`
   - Mount Path: `/var/lib/mysql`
   - Size: `10 GB`
6. Add Environment Variables:
   - `MYSQL_ROOT_PASSWORD` = `rootpassword`
   - `MYSQL_DATABASE` = `banking_db`
   - `MYSQL_USER` = `banking_user`
   - `MYSQL_PASSWORD` = `banking_password`
7. Click **Create Private Service**. Copy its internal service address (e.g. `banking-mysql:3306`).

### 2. Backend (`banking-backend`)
1. Click **New +** -> **Web Service**.
2. Connect repository.
3. Set **Runtime**: **Docker**.
4. Set **Dockerfile Path**: `Dockerfile`.
5. Under **Environment Variables**, add:
   - `DB_HOST` = `banking-mysql`
   - `DB_PORT` = `3306`
   - `DB_NAME` = `banking_db`
   - `DB_USER` = `banking_user`
   - `DB_PASSWORD` = `banking_password`
   - `SPRING_JPA_HIBERNATE_DDL_AUTO` = `update`
   - `JWT_SECRET` = `MySuperSecretKeyForBankingSystem2024ForJWTTokenGeneration`
   - `CORS_ORIGINS` = `https://*.onrender.com,http://localhost:3000`
6. Set **Health Check Path**: `/api/actuator/health`.
7. Click **Create Web Service**. Note your backend URL (e.g., `https://banking-backend.onrender.com`).

### 3. Frontend (`banking-frontend`)
1. Click **New +** -> **Static Site**.
2. Connect repository.
3. Set:
   - **Build Command**: `cd banking-system/frontend && npm install && npm run build`
   - **Publish Directory**: `banking-system/frontend/dist`
4. Under **Redirects / Rewrites**, add:
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
5. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://<your-backend-name>.onrender.com/api`
6. Click **Create Static Site**.

---

## 🔑 Default Credentials

Once deployed, you can immediately log in using the pre-seeded accounts:

| Role | Username | Password |
|---|---|---|
| **System Admin** | `admin` | `Admin@123` |
| **Customer** | `rahul.sharma` | `Customer@123` |
| **Customer** | `priya.patel` | `Customer@123` |
| **Customer** | `arjun.mehta` | `Customer@123` |

---

## 🔍 Verification & Health Checks

1. **Backend Health Check**:
   Visit `https://<your-backend>.onrender.com/api/actuator/health`.
   It should return:
   ```json
   {"status":"UP"}
   ```
2. **Swagger / OpenAPI**:
   Visit `https://<your-backend>.onrender.com/swagger-ui.html`.
3. **Frontend**:
   Visit `https://<your-frontend>.onrender.com/`. Log in with `admin` / `Admin@123`.

---

## 💡 Troubleshooting

- **CORS Error**: Ensure `CORS_ORIGINS` environment variable in the backend includes `https://*.onrender.com`.
- **Database Connection Error**: In Render, internal communication between services uses the Private Service name (e.g., `banking-mysql` and port `3306`).
- **Free Tier Inactivity**: Render free web services spin down after 15 minutes of inactivity. The first request after sleep may take ~30–50 seconds to wake up the service.
