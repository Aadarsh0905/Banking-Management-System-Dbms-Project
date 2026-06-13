# Data Dictionary — Banking Management System

## Table: users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique user identifier |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| email | VARCHAR(100) | UNIQUE, NOT NULL | Email address |
| password_hash | VARCHAR(255) | NOT NULL | BCrypt hashed password (strength 12) |
| first_name | VARCHAR(50) | NOT NULL | First name |
| last_name | VARCHAR(50) | NOT NULL | Last name |
| phone | VARCHAR(15) | UNIQUE, NOT NULL | Mobile number |
| date_of_birth | DATE | NULL | Date of birth |
| gender | ENUM | NULL | MALE, FEMALE, OTHER |
| profile_picture_url | VARCHAR(500) | NULL | Avatar URL |
| is_active | BOOLEAN | DEFAULT TRUE | Account active flag |
| is_locked | BOOLEAN | DEFAULT FALSE | Locked after failed logins |
| failed_login_count | INT | DEFAULT 0 | Consecutive failed attempts |
| last_login_at | TIMESTAMP | NULL | Last successful login time |
| email_verified | BOOLEAN | DEFAULT FALSE | Email verification status |
| email_verify_token | VARCHAR(255) | NULL | One-time verification token |
| password_reset_token | VARCHAR(255) | NULL | Password reset token |
| password_reset_expires | TIMESTAMP | NULL | Token expiry time |
| created_at | TIMESTAMP | DEFAULT NOW | Record creation time |
| updated_at | TIMESTAMP | ON UPDATE NOW | Last update time |

## Table: accounts
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique account ID |
| account_number | VARCHAR(20) | UNIQUE, NOT NULL | ACC + 10 digits |
| user_id | BIGINT | FK→users.id | Account owner |
| branch_id | BIGINT | FK→branches.id | Home branch |
| account_type_id | BIGINT | FK→account_types.id | Savings/Current/FD |
| balance | DECIMAL(15,2) | NOT NULL | Current ledger balance |
| available_balance | DECIMAL(15,2) | NOT NULL | Spendable balance |
| currency | VARCHAR(5) | DEFAULT 'INR' | Currency code |
| status | ENUM | DEFAULT 'PENDING' | PENDING/ACTIVE/DORMANT/FROZEN/CLOSED |
| opened_at | DATE | NOT NULL | Account opening date |
| closed_at | DATE | NULL | Account closure date |
| last_transaction_at | TIMESTAMP | NULL | Last activity time |
| nominee_name | VARCHAR(100) | NULL | Nominee full name |
| nominee_relation | VARCHAR(50) | NULL | Relationship to account holder |
| version | INT | DEFAULT 0 | Optimistic lock version counter |

## Table: transactions
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Unique transaction ID |
| transaction_ref | VARCHAR(30) | UNIQUE, NOT NULL | TXN + timestamp + random |
| from_account_id | BIGINT | FK→accounts.id, NULL | Debit account (NULL for deposits) |
| to_account_id | BIGINT | FK→accounts.id, NULL | Credit account (NULL for withdrawals) |
| transaction_type | ENUM | NOT NULL | DEPOSIT/WITHDRAWAL/TRANSFER/UPI_CREDIT/UPI_DEBIT/EMI_DEBIT/INTEREST_CREDIT/CHARGE/REVERSAL |
| amount | DECIMAL(15,2) | NOT NULL | Transaction amount |
| currency | VARCHAR(5) | DEFAULT 'INR' | Currency |
| balance_before | DECIMAL(15,2) | NULL | Source account balance before |
| balance_after | DECIMAL(15,2) | NULL | Source account balance after |
| description | VARCHAR(300) | NULL | User-provided note |
| status | ENUM | DEFAULT 'PENDING' | PENDING/PROCESSING/SUCCESS/FAILED/REVERSED |
| channel | ENUM | DEFAULT 'NETBANKING' | NETBANKING/MOBILE/ATM/BRANCH/UPI/NEFT/RTGS/IMPS |
| ip_address | VARCHAR(45) | NULL | Originating IP |
| failure_reason | VARCHAR(300) | NULL | Failure message if failed |
| initiated_at | TIMESTAMP | NULL | When transaction started |
| completed_at | TIMESTAMP | NULL | When transaction finished |

## Table: loans
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | Loan ID |
| loan_account_number | VARCHAR(20) | UNIQUE | LACC + timestamp |
| application_id | BIGINT | FK→loan_applications.id, UNIQUE | Source application |
| user_id | BIGINT | FK→users.id | Borrower |
| principal_amount | DECIMAL(15,2) | NOT NULL | Approved loan amount |
| interest_rate | DECIMAL(5,2) | NOT NULL | Annual interest % |
| tenure_months | INT | NOT NULL | Repayment period |
| emi_amount | DECIMAL(12,2) | NOT NULL | Monthly EMI |
| processing_fee | DECIMAL(12,2) | DEFAULT 0 | One-time processing charge |
| outstanding_balance | DECIMAL(15,2) | NOT NULL | Remaining principal |
| disbursed_at | DATE | NOT NULL | Disbursement date |
| first_emi_date | DATE | NOT NULL | First EMI due date |
| last_emi_date | DATE | NOT NULL | Final EMI due date |
| status | ENUM | DEFAULT 'ACTIVE' | ACTIVE/CLOSED/DEFAULTED/NPA |

## Table: emi_schedule
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | EMI row ID |
| loan_id | BIGINT | FK→loans.id | Parent loan |
| emi_number | INT | NOT NULL | Sequential EMI number (1-N) |
| due_date | DATE | NOT NULL | Payment due date |
| emi_amount | DECIMAL(12,2) | NOT NULL | Total EMI payable |
| principal_component | DECIMAL(12,2) | NOT NULL | Principal portion of EMI |
| interest_component | DECIMAL(12,2) | NOT NULL | Interest portion of EMI |
| outstanding_after | DECIMAL(15,2) | NOT NULL | Balance after this EMI |
| paid_amount | DECIMAL(12,2) | DEFAULT 0 | Amount actually paid |
| paid_at | TIMESTAMP | NULL | Payment timestamp |
| status | ENUM | DEFAULT 'UPCOMING' | UPCOMING/PAID/OVERDUE/PARTIAL |
| transaction_id | BIGINT | FK→transactions.id, NULL | Payment transaction |

## Table: cards
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | Card ID |
| card_number | VARCHAR(20) | UNIQUE | Masked: XXXXXXXXXXXX1234 |
| user_id | BIGINT | FK→users.id | Card holder |
| account_id | BIGINT | FK→accounts.id | Linked account |
| card_type | ENUM | NOT NULL | DEBIT / CREDIT |
| card_network | ENUM | DEFAULT 'RUPAY' | VISA / MASTERCARD / RUPAY |
| card_holder_name | VARCHAR(100) | NOT NULL | Embossed name |
| expiry_month | INT | NOT NULL | 1–12 |
| expiry_year | INT | NOT NULL | 4-digit year |
| cvv_hash | VARCHAR(255) | NOT NULL | BCrypt hashed CVV |
| pin_hash | VARCHAR(255) | NULL | BCrypt hashed PIN |
| credit_limit | DECIMAL(12,2) | NULL | Only for credit cards |
| outstanding_balance | DECIMAL(12,2) | DEFAULT 0 | Credit card dues |
| status | ENUM | DEFAULT 'REQUESTED' | REQUESTED/ACTIVE/BLOCKED/EXPIRED/CANCELLED |
| is_international_enabled | BOOLEAN | DEFAULT FALSE | Intl transactions flag |
| is_online_enabled | BOOLEAN | DEFAULT TRUE | Online transactions flag |
| is_contactless_enabled | BOOLEAN | DEFAULT TRUE | Tap-to-pay flag |

## Table: upi_ids
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | UPI record ID |
| user_id | BIGINT | FK→users.id | Owner |
| account_id | BIGINT | FK→accounts.id | Linked account |
| upi_id | VARCHAR(100) | UNIQUE | e.g. name@bankname |
| qr_code_url | VARCHAR(500) | NULL | Stored QR image URL |
| is_default | BOOLEAN | DEFAULT FALSE | Primary UPI ID flag |
| is_active | BOOLEAN | DEFAULT TRUE | Soft delete flag |

## Table: kyc_details
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK | KYC record ID |
| user_id | BIGINT | FK→users.id, UNIQUE | One KYC per user |
| aadhaar_number | VARCHAR(20) | UNIQUE | 12-digit Aadhaar |
| pan_number | VARCHAR(15) | UNIQUE | 10-char PAN |
| address_line1 | VARCHAR(200) | NOT NULL | Permanent address |
| city | VARCHAR(80) | NOT NULL | City |
| state | VARCHAR(80) | NOT NULL | State |
| pincode | VARCHAR(10) | NOT NULL | 6-digit postal code |
| kyc_status | ENUM | DEFAULT 'PENDING' | PENDING/SUBMITTED/VERIFIED/REJECTED |
| verified_at | TIMESTAMP | NULL | Verification timestamp |
| verified_by | BIGINT | FK→users.id, NULL | Admin who verified |
| remarks | TEXT | NULL | Review notes |

## Table: audit_logs
| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT PK | Log entry ID |
| user_id | FK→users | Who performed the action |
| action | VARCHAR(100) | Action type (e.g. UPDATE, DELETE) |
| entity_type | VARCHAR(50) | Table/entity name (e.g. ACCOUNT) |
| entity_id | VARCHAR(50) | Record ID affected |
| old_value | JSON | State before change |
| new_value | JSON | State after change |
| ip_address | VARCHAR(45) | Client IP |
| created_at | TIMESTAMP | When the action occurred |
