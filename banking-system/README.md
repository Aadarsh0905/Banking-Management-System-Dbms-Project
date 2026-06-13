# 🏦 Banking Management System

A production-ready, full-stack banking management system built with **Spring Boot 3**, **React 18**, **MySQL 8**, and **Docker**.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start (Docker)](#quick-start-docker)
- [Manual Setup](#manual-setup)
- [Default Credentials](#default-credentials)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Testing](#testing)

---

## 🛠️ Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 18, Tailwind CSS, Bootstrap 5, Chart.js, Axios|
| Backend   | Java 21, Spring Boot 3, Spring Security, JWT        |
| Database  | MySQL 8 (3NF, Stored Procs, Triggers, Views)        |
| DevOps    | Docker, Docker Compose, Nginx                       |
| AI        | Claude AI (Anthropic) — Banking Chatbot             |

---

## ✅ Features

### User Module
- Customer registration & secure login
- JWT authentication with refresh tokens
- Forgot / reset password via email
- Profile management & avatar upload
- KYC verification (Aadhaar + PAN)
- Beneficiary management

### Account Module
- Savings, Current, Fixed Deposit accounts
- Open / close accounts
- Account statement PDF download
- Branch selection

### Transaction Module
- Deposit, Withdrawal, Fund Transfer
- UPI payments & QR code generation
- Scheduled / recurring transfers
- Transaction history with filters
- Receipt PDF download

### Loan Module
- Personal, Home, Education loans
- EMI calculator
- Loan application & tracking
- Full EMI schedule with amortization
- EMI payment processing

### Card Module
- Debit & Credit card requests
- Block / Unblock cards
- PIN management
- Card settings (online / international / contactless)

### Notification Module
- In-app notifications
- Email alerts (transaction, login, low balance, KYC)
- Unread badge count

### Admin Module
- Dashboard with live statistics & charts
- Customer management (activate / deactivate / unlock)
- KYC review & approval
- Loan approval / rejection workflow
- Transaction monitoring
- Branch management

### AI Module
- Banking chatbot powered by Claude AI
- Contextual banking assistance
- Quick-action suggestions

### Security
- BCrypt password hashing (strength 12)
- JWT access + refresh tokens
- Role-Based Access Control (CUSTOMER / ADMIN / EMPLOYEE)
- Account lock after 5 failed login attempts
- Optimistic locking for concurrent transactions
- SQL injection protection via JPA
- CORS configuration
- Audit logging

---

## 📁 Project Structure

```
banking-system/
├── backend/                          # Spring Boot application
│   ├── src/main/java/com/banking/
│   │   ├── BankingManagementSystemApplication.java
│   │   ├── config/          # Swagger, Scheduler, extra repos
│   │   ├── controller/      # REST controllers (all modules)
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── entity/          # JPA Entities
│   │   ├── exception/       # Global exception handler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT, Security config, UserDetails
│   │   └── service/         # Business logic (all modules)
│   ├── src/main/resources/
│   │   └── application.properties
│   ├── src/test/            # Unit & integration tests
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/      # Layout, Sidebar, Navbar
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── pages/           # All pages (Auth, Dashboard, etc.)
│   │   │   └── admin/       # Admin pages
│   │   ├── services/        # Axios API service
│   │   ├── App.jsx          # Router + route guards
│   │   ├── main.jsx
│   │   └── index.css        # Tailwind + global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── package.json
│
├── database/
│   ├── 01_schema.sql                 # All CREATE TABLE statements
│   ├── 02_indexes_views_procedures.sql  # Indexes, Views, Stored Procs, Triggers
│   └── 03_seed_data.sql             # Sample data
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 Quick Start (Docker)

### Prerequisites
- Docker Desktop 24+
- Docker Compose v2+

```bash
# 1. Clone the repository
git clone https://github.com/yourname/banking-management-system.git
cd banking-management-system

# 2. Set up environment
cp .env.example .env
# Edit .env with your mail credentials (optional for development)

# 3. Start the full stack
docker-compose up --build

# With phpMyAdmin (dev only)
docker-compose --profile dev up --build
```

| Service      | URL                            |
|--------------|-------------------------------|
| Frontend     | http://localhost:3000          |
| Backend API  | http://localhost:8080/api      |
| Swagger UI   | http://localhost:8080/api/swagger-ui.html |
| phpMyAdmin   | http://localhost:8081          |

---

## 🔧 Manual Setup

### 1. Database

```bash
# Start MySQL 8
mysql -u root -p

# Run scripts in order
SOURCE database/01_schema.sql;
SOURCE database/02_indexes_views_procedures.sql;
SOURCE database/03_seed_data.sql;
```

### 2. Backend

```bash
cd backend

# Configure database in application.properties or set env vars
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=MySuperSecretKey32CharsMinimumLength

# Run
mvn spring-boot:run

# Or build JAR
mvn clean package -DskipTests
java -jar target/banking-management-system-*.jar
```

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env
cp .env.example .env
# Set VITE_API_URL=http://localhost:8080/api

# Development server
npm run dev          # → http://localhost:3000

# Production build
npm run build
```

---

## 🔑 Default Credentials

| Role     | Username     | Password       |
|----------|-------------|----------------|
| Admin    | `admin`      | `Admin@123`    |
| Customer | `rahul.sharma` | `Customer@123` |
| Customer | `priya.patel`  | `Customer@123` |
| Employee | `emp.kumar`    | `Admin@123`    |

---

## 📡 API Documentation

Swagger UI: **http://localhost:8080/api/swagger-ui.html**

### Auth Endpoints

| Method | Endpoint                     | Description          | Auth |
|--------|------------------------------|----------------------|------|
| POST   | `/auth/register`             | Register new user    | ❌   |
| POST   | `/auth/login`                | Login, get JWT       | ❌   |
| POST   | `/auth/forgot-password`      | Send reset email     | ❌   |
| POST   | `/auth/reset-password`       | Reset password       | ❌   |
| POST   | `/auth/refresh`              | Refresh access token | ❌   |

### Account Endpoints

| Method | Endpoint                  | Description            | Auth |
|--------|---------------------------|------------------------|------|
| GET    | `/accounts`               | Get my accounts        | ✅   |
| POST   | `/accounts/open`          | Open new account       | ✅   |
| PATCH  | `/accounts/{id}/close`    | Close account          | ✅   |
| POST   | `/accounts/statement`     | Download PDF statement | ✅   |

### Transaction Endpoints

| Method | Endpoint                       | Description          |
|--------|--------------------------------|----------------------|
| POST   | `/transactions/deposit`        | Cash deposit         |
| POST   | `/transactions/withdraw`       | Withdrawal           |
| POST   | `/transactions/transfer`       | Fund transfer        |
| GET    | `/transactions`                | History (paginated)  |
| GET    | `/transactions/search`         | Search with filters  |
| GET    | `/transactions/{ref}/receipt`  | PDF receipt          |

### Admin Endpoints

| Method | Endpoint                      | Description              |
|--------|-------------------------------|--------------------------|
| GET    | `/admin/dashboard`            | Stats & KPIs             |
| GET    | `/admin/customers`            | All customers (paginated)|
| PATCH  | `/admin/customers/{id}/unlock`| Unlock account           |
| GET    | `/admin/kyc/pending`          | Pending KYC list         |
| PATCH  | `/admin/kyc/{id}/verify`      | Approve/reject KYC       |
| GET    | `/admin/loans/pending`        | Pending loan apps        |
| POST   | `/admin/loans/review`         | Approve/reject loan      |

---

## 🗄️ Database Schema

### Core Tables (14 tables)
`users` · `roles` · `user_roles` · `kyc_details` · `kyc_documents` · `branches` · `employees` · `account_types` · `accounts` · `fixed_deposits` · `transactions` · `scheduled_transfers` · `beneficiaries`

### Feature Tables (9 tables)
`upi_ids` · `upi_transactions` · `upi_payment_requests` · `loan_types` · `loan_applications` · `loans` · `emi_schedule` · `cards` · `card_transactions`

### System Tables (4 tables)
`notifications` · `notification_templates` · `audit_logs` · `login_attempts` · `refresh_tokens`

### Views
- `vw_account_summary` — account + user + branch details
- `vw_transaction_history` — full transaction details with user info
- `vw_loan_summary` — loan + EMI stats

### Stored Procedures
- `sp_generate_account_number()` — unique ACC number
- `sp_fund_transfer()` — atomic transfer with optimistic lock
- `sp_generate_emi_schedule()` — full amortization schedule
- `sp_account_statement()` — statement for a date range

### Triggers
- `trg_account_audit_update` — audit on balance change
- `trg_lock_user_on_failed_login` — lock after 5 failures
- `trg_low_balance_notification` — alert when balance < ₹1000

---

## 🔒 Security Architecture

```
Client → HTTPS → Nginx → Spring Security Filter Chain
                              ↓
                         JWT Filter (validates token)
                              ↓
                         RBAC (hasRole checks)
                              ↓
                         Service Layer
                              ↓
                   Hibernate (parameterised queries — no SQL injection)
                              ↓
                           MySQL
```

- **Passwords**: BCrypt strength 12
- **Tokens**: HS256 JWT, 15-min access + 7-day refresh
- **Concurrency**: Optimistic locking (`@Version`) on Account.balance
- **Audit**: Every account update logged to `audit_logs`
- **Rate limiting**: Account lock after 5 failed login attempts (30-min window)

---

## 🧪 Testing

```bash
cd backend

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Generate coverage report
mvn jacoco:report
# Open target/site/jacoco/index.html
```

### Test Coverage
- `AuthServiceTest` — register, login, duplicate user, bad credentials, locked account
- `AccountServiceTest` — open account, close with balance, unauthorized access
- `TransactionServiceTest` — deposit, withdraw insufficient, transfer, same-account guard
- `LoanServiceTest` — EMI calculation accuracy

---

## 📦 Production Deployment

```bash
# Build production images
docker-compose build

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down

# Stop + remove volumes (CAUTION: deletes DB data)
docker-compose down -v
```

### Environment Variables for Production

| Variable          | Description                    | Required |
|-------------------|--------------------------------|----------|
| `DB_PASSWORD`     | MySQL password                 | ✅        |
| `JWT_SECRET`      | 64-char secret key             | ✅        |
| `MAIL_USER`       | Gmail / SMTP username          | ✅        |
| `MAIL_PASS`       | App password (not login pwd)   | ✅        |
| `CORS_ORIGINS`    | Allowed frontend origins       | ✅        |

---

## 📝 License

MIT License — free for academic and personal use.

---

**Built as a DBMS course project demonstrating:**
- Normalized relational schema (3NF)
- Complex SQL: stored procedures, triggers, views, indexes
- Full-stack REST API with authentication
- Production-grade security patterns
- Containerized deployment
