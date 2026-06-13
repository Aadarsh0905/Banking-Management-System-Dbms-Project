-- ============================================================
-- BANKING MANAGEMENT SYSTEM — COMPLETE DATABASE SCHEMA
-- MySQL 8.0 | Normalized to 3NF
-- ============================================================

CREATE DATABASE IF NOT EXISTS banking_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE banking_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- 1. ROLES & USERS
-- ============================================================

CREATE TABLE roles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(30) NOT NULL UNIQUE,        -- ROLE_CUSTOMER, ROLE_ADMIN, ROLE_EMPLOYEE
    description VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    username            VARCHAR(50)  NOT NULL UNIQUE,
    email               VARCHAR(100) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    first_name          VARCHAR(50)  NOT NULL,
    last_name           VARCHAR(50)  NOT NULL,
    phone               VARCHAR(15)  NOT NULL UNIQUE,
    date_of_birth       DATE,
    gender              ENUM('MALE','FEMALE','OTHER'),
    profile_picture_url VARCHAR(500),
    is_active           BOOLEAN      DEFAULT TRUE,
    is_locked           BOOLEAN      DEFAULT FALSE,
    failed_login_count  INT          DEFAULT 0,
    last_login_at       TIMESTAMP    NULL,
    password_reset_token     VARCHAR(255) NULL,
    password_reset_expires   TIMESTAMP   NULL,
    email_verified      BOOLEAN      DEFAULT FALSE,
    email_verify_token  VARCHAR(255) NULL,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ============================================================
-- 2. KYC
-- ============================================================

CREATE TABLE kyc_details (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NOT NULL UNIQUE,
    aadhaar_number  VARCHAR(20)  UNIQUE,
    pan_number      VARCHAR(15)  UNIQUE,
    passport_number VARCHAR(20)  UNIQUE,
    address_line1   VARCHAR(200) NOT NULL,
    address_line2   VARCHAR(200),
    city            VARCHAR(80)  NOT NULL,
    state           VARCHAR(80)  NOT NULL,
    pincode         VARCHAR(10)  NOT NULL,
    country         VARCHAR(60)  DEFAULT 'India',
    kyc_status      ENUM('PENDING','SUBMITTED','VERIFIED','REJECTED') DEFAULT 'PENDING',
    verified_at     TIMESTAMP    NULL,
    verified_by     BIGINT       NULL,
    remarks         TEXT,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)     REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

CREATE TABLE kyc_documents (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    kyc_id        BIGINT       NOT NULL,
    document_type VARCHAR(50)  NOT NULL,   -- AADHAAR_FRONT, PAN_CARD, PASSPORT, etc.
    file_url      VARCHAR(500) NOT NULL,
    uploaded_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kyc_id) REFERENCES kyc_details(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. BRANCHES & EMPLOYEES
-- ============================================================

CREATE TABLE branches (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    branch_code  VARCHAR(20)  NOT NULL UNIQUE,
    branch_name  VARCHAR(100) NOT NULL,
    address      VARCHAR(300) NOT NULL,
    city         VARCHAR(80)  NOT NULL,
    state        VARCHAR(80)  NOT NULL,
    pincode      VARCHAR(10)  NOT NULL,
    phone        VARCHAR(15),
    email        VARCHAR(100),
    ifsc_code    VARCHAR(15)  NOT NULL UNIQUE,
    is_active    BOOLEAN      DEFAULT TRUE,
    created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE employees (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT       NOT NULL UNIQUE,
    branch_id     BIGINT       NOT NULL,
    employee_code VARCHAR(20)  NOT NULL UNIQUE,
    designation   VARCHAR(100) NOT NULL,
    department    VARCHAR(100),
    joining_date  DATE         NOT NULL,
    salary        DECIMAL(12,2),
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id),
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ============================================================
-- 4. ACCOUNTS
-- ============================================================

CREATE TABLE account_types (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_code     VARCHAR(30)    NOT NULL UNIQUE,  -- SAVINGS, CURRENT, FIXED_DEPOSIT
    type_name     VARCHAR(80)    NOT NULL,
    interest_rate DECIMAL(5,2)   DEFAULT 0.00,
    min_balance   DECIMAL(12,2)  DEFAULT 0.00,
    description   TEXT,
    is_active     BOOLEAN        DEFAULT TRUE
);

CREATE TABLE accounts (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number   VARCHAR(20)    NOT NULL UNIQUE,
    user_id          BIGINT         NOT NULL,
    branch_id        BIGINT         NOT NULL,
    account_type_id  BIGINT         NOT NULL,
    balance          DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
    available_balance DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    currency         VARCHAR(5)     DEFAULT 'INR',
    status           ENUM('PENDING','ACTIVE','DORMANT','FROZEN','CLOSED') DEFAULT 'PENDING',
    opened_at        DATE           NOT NULL,
    closed_at        DATE           NULL,
    last_transaction_at TIMESTAMP   NULL,
    nominee_name     VARCHAR(100),
    nominee_relation VARCHAR(50),
    version          INT            DEFAULT 0,   -- optimistic locking
    created_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)         REFERENCES users(id),
    FOREIGN KEY (branch_id)       REFERENCES branches(id),
    FOREIGN KEY (account_type_id) REFERENCES account_types(id)
);

CREATE TABLE fixed_deposits (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id      BIGINT         NOT NULL UNIQUE,
    principal       DECIMAL(15,2)  NOT NULL,
    interest_rate   DECIMAL(5,2)   NOT NULL,
    tenure_months   INT            NOT NULL,
    maturity_amount DECIMAL(15,2)  NOT NULL,
    start_date      DATE           NOT NULL,
    maturity_date   DATE           NOT NULL,
    status          ENUM('ACTIVE','MATURED','BROKEN','RENEWED') DEFAULT 'ACTIVE',
    auto_renew      BOOLEAN        DEFAULT FALSE,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- ============================================================
-- 5. TRANSACTIONS
-- ============================================================

CREATE TABLE transactions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_ref     VARCHAR(30)   NOT NULL UNIQUE,
    from_account_id     BIGINT        NULL,
    to_account_id       BIGINT        NULL,
    transaction_type    ENUM('DEPOSIT','WITHDRAWAL','TRANSFER','UPI_CREDIT','UPI_DEBIT',
                             'EMI_DEBIT','INTEREST_CREDIT','CHARGE','REVERSAL') NOT NULL,
    amount              DECIMAL(15,2) NOT NULL,
    currency            VARCHAR(5)    DEFAULT 'INR',
    balance_before      DECIMAL(15,2),
    balance_after       DECIMAL(15,2),
    description         VARCHAR(300),
    remarks             VARCHAR(300),
    status              ENUM('PENDING','PROCESSING','SUCCESS','FAILED','REVERSED') DEFAULT 'PENDING',
    channel             ENUM('NETBANKING','MOBILE','ATM','BRANCH','UPI','NEFT','RTGS','IMPS') DEFAULT 'NETBANKING',
    ip_address          VARCHAR(45),
    device_info         VARCHAR(200),
    failure_reason      VARCHAR(300),
    initiated_at        TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    completed_at        TIMESTAMP     NULL,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id)   REFERENCES accounts(id)
);

CREATE TABLE scheduled_transfers (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    from_account_id     BIGINT        NOT NULL,
    to_account_id       BIGINT        NOT NULL,
    amount              DECIMAL(15,2) NOT NULL,
    description         VARCHAR(300),
    frequency           ENUM('ONCE','DAILY','WEEKLY','MONTHLY') NOT NULL,
    next_execution_date DATE          NOT NULL,
    end_date            DATE          NULL,
    status              ENUM('ACTIVE','PAUSED','COMPLETED','FAILED') DEFAULT 'ACTIVE',
    last_executed_at    TIMESTAMP     NULL,
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_account_id) REFERENCES accounts(id),
    FOREIGN KEY (to_account_id)   REFERENCES accounts(id)
);

-- ============================================================
-- 6. BENEFICIARIES
-- ============================================================

CREATE TABLE beneficiaries (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id             BIGINT       NOT NULL,
    nickname            VARCHAR(50)  NOT NULL,
    account_number      VARCHAR(20)  NOT NULL,
    ifsc_code           VARCHAR(15)  NOT NULL,
    bank_name           VARCHAR(100),
    beneficiary_name    VARCHAR(100) NOT NULL,
    is_active           BOOLEAN      DEFAULT TRUE,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uq_user_account (user_id, account_number)
);

-- ============================================================
-- 7. UPI
-- ============================================================

CREATE TABLE upi_ids (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    account_id  BIGINT       NOT NULL,
    upi_id      VARCHAR(100) NOT NULL UNIQUE,   -- e.g. username@bankname
    qr_code_url VARCHAR(500),
    is_default  BOOLEAN      DEFAULT FALSE,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)   REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE upi_transactions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id  BIGINT       NOT NULL,
    sender_upi_id   VARCHAR(100) NOT NULL,
    receiver_upi_id VARCHAR(100) NOT NULL,
    upi_ref_number  VARCHAR(50)  NOT NULL UNIQUE,
    status          ENUM('INITIATED','SUCCESS','FAILED','PENDING') DEFAULT 'INITIATED',
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE upi_payment_requests (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    requester_upi   VARCHAR(100)  NOT NULL,
    payer_upi       VARCHAR(100)  NOT NULL,
    amount          DECIMAL(12,2) NOT NULL,
    description     VARCHAR(200),
    status          ENUM('PENDING','PAID','REJECTED','EXPIRED') DEFAULT 'PENDING',
    expires_at      TIMESTAMP     NOT NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 8. LOANS
-- ============================================================

CREATE TABLE loan_types (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_code       VARCHAR(30)   NOT NULL UNIQUE,  -- PERSONAL, HOME, EDUCATION
    type_name       VARCHAR(80)   NOT NULL,
    min_amount      DECIMAL(15,2) NOT NULL,
    max_amount      DECIMAL(15,2) NOT NULL,
    min_tenure_months INT         NOT NULL,
    max_tenure_months INT         NOT NULL,
    interest_rate   DECIMAL(5,2)  NOT NULL,
    processing_fee_pct DECIMAL(5,2) DEFAULT 0.00,
    is_active       BOOLEAN       DEFAULT TRUE
);

CREATE TABLE loan_applications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_no  VARCHAR(20)   NOT NULL UNIQUE,
    user_id         BIGINT        NOT NULL,
    loan_type_id    BIGINT        NOT NULL,
    account_id      BIGINT        NOT NULL,     -- disbursal account
    amount_requested DECIMAL(15,2) NOT NULL,
    tenure_months   INT           NOT NULL,
    purpose         TEXT,
    annual_income   DECIMAL(15,2),
    employment_type ENUM('SALARIED','SELF_EMPLOYED','BUSINESS','OTHER'),
    employer_name   VARCHAR(200),
    status          ENUM('DRAFT','SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','DISBURSED','CLOSED') DEFAULT 'DRAFT',
    reviewed_by     BIGINT        NULL,
    reviewed_at     TIMESTAMP     NULL,
    review_remarks  TEXT,
    submitted_at    TIMESTAMP     NULL,
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)      REFERENCES users(id),
    FOREIGN KEY (loan_type_id) REFERENCES loan_types(id),
    FOREIGN KEY (account_id)   REFERENCES accounts(id),
    FOREIGN KEY (reviewed_by)  REFERENCES users(id)
);

CREATE TABLE loans (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_account_number VARCHAR(20)   NOT NULL UNIQUE,
    application_id      BIGINT        NOT NULL UNIQUE,
    user_id             BIGINT        NOT NULL,
    principal_amount    DECIMAL(15,2) NOT NULL,
    interest_rate       DECIMAL(5,2)  NOT NULL,
    tenure_months       INT           NOT NULL,
    emi_amount          DECIMAL(12,2) NOT NULL,
    processing_fee      DECIMAL(12,2) DEFAULT 0.00,
    outstanding_balance DECIMAL(15,2) NOT NULL,
    disbursed_at        DATE          NOT NULL,
    first_emi_date      DATE          NOT NULL,
    last_emi_date       DATE          NOT NULL,
    status              ENUM('ACTIVE','CLOSED','DEFAULTED','NPA') DEFAULT 'ACTIVE',
    created_at          TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES loan_applications(id),
    FOREIGN KEY (user_id)        REFERENCES users(id)
);

CREATE TABLE emi_schedule (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_id         BIGINT        NOT NULL,
    emi_number      INT           NOT NULL,
    due_date        DATE          NOT NULL,
    emi_amount      DECIMAL(12,2) NOT NULL,
    principal_component DECIMAL(12,2) NOT NULL,
    interest_component  DECIMAL(12,2) NOT NULL,
    outstanding_after   DECIMAL(15,2) NOT NULL,
    paid_amount     DECIMAL(12,2) DEFAULT 0.00,
    paid_at         TIMESTAMP     NULL,
    status          ENUM('UPCOMING','PAID','OVERDUE','PARTIAL') DEFAULT 'UPCOMING',
    transaction_id  BIGINT        NULL,
    FOREIGN KEY (loan_id)       REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(id),
    UNIQUE KEY uq_loan_emi (loan_id, emi_number)
);

-- ============================================================
-- 9. CARDS
-- ============================================================

CREATE TABLE cards (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_number     VARCHAR(20)  NOT NULL UNIQUE,   -- masked: XXXXXXXXXXXX1234
    user_id         BIGINT       NOT NULL,
    account_id      BIGINT       NOT NULL,
    card_type       ENUM('DEBIT','CREDIT') NOT NULL,
    card_network    ENUM('VISA','MASTERCARD','RUPAY') DEFAULT 'RUPAY',
    card_holder_name VARCHAR(100) NOT NULL,
    expiry_month    INT          NOT NULL,
    expiry_year     INT          NOT NULL,
    cvv_hash        VARCHAR(255) NOT NULL,
    pin_hash        VARCHAR(255),
    credit_limit    DECIMAL(12,2) NULL,             -- only for credit cards
    outstanding_balance DECIMAL(12,2) DEFAULT 0.00,
    status          ENUM('REQUESTED','ACTIVE','BLOCKED','EXPIRED','CANCELLED') DEFAULT 'REQUESTED',
    is_international_enabled BOOLEAN DEFAULT FALSE,
    is_online_enabled        BOOLEAN DEFAULT TRUE,
    is_contactless_enabled   BOOLEAN DEFAULT TRUE,
    requested_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    activated_at    TIMESTAMP    NULL,
    blocked_at      TIMESTAMP    NULL,
    block_reason    VARCHAR(200) NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE card_transactions (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    card_id         BIGINT        NOT NULL,
    transaction_id  BIGINT        NOT NULL,
    merchant_name   VARCHAR(200),
    merchant_category VARCHAR(100),
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id)       REFERENCES cards(id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ============================================================
-- 10. NOTIFICATIONS
-- ============================================================

CREATE TABLE notification_templates (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(50)  NOT NULL UNIQUE,
    subject     VARCHAR(200),
    body        TEXT         NOT NULL,
    channel     ENUM('EMAIL','SMS','IN_APP') NOT NULL,
    is_active   BOOLEAN      DEFAULT TRUE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT       NOT NULL,
    template_id     BIGINT       NULL,
    title           VARCHAR(200) NOT NULL,
    message         TEXT         NOT NULL,
    channel         ENUM('EMAIL','SMS','IN_APP') NOT NULL,
    status          ENUM('PENDING','SENT','FAILED','READ') DEFAULT 'PENDING',
    sent_at         TIMESTAMP    NULL,
    read_at         TIMESTAMP    NULL,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)    REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES notification_templates(id)
);

-- ============================================================
-- 11. AUDIT & SECURITY
-- ============================================================

CREATE TABLE audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NULL,
    action      VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   VARCHAR(50),
    old_value   JSON,
    new_value   JSON,
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE login_attempts (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL,
    ip_address  VARCHAR(45),
    success     BOOLEAN      NOT NULL,
    failure_reason VARCHAR(200),
    attempted_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(500) NOT NULL UNIQUE,
    expires_at  TIMESTAMP    NOT NULL,
    revoked     BOOLEAN      DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

SET FOREIGN_KEY_CHECKS = 1;
