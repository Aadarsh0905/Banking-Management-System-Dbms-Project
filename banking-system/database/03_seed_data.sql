USE banking_db;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Roles
INSERT INTO roles(name, description) VALUES
('ROLE_CUSTOMER', 'Regular bank customer'),
('ROLE_ADMIN',    'Bank administrator'),
('ROLE_EMPLOYEE', 'Bank employee');

-- Branches
INSERT INTO branches(branch_code, branch_name, address, city, state, pincode, phone, email, ifsc_code) VALUES
('BR001', 'Main Branch',      '1 MG Road, Connaught Place', 'New Delhi',  'Delhi',       '110001', '011-12345678', 'main@bank.com',   'BANK0000001'),
('BR002', 'South Delhi Branch','15 Lajpat Nagar',           'New Delhi',  'Delhi',       '110024', '011-23456789', 'south@bank.com',  'BANK0000002'),
('BR003', 'Mumbai Main',       '42 Nariman Point',          'Mumbai',     'Maharashtra', '400021', '022-34567890', 'mumbai@bank.com', 'BANK0000003');

-- Account Types
INSERT INTO account_types(type_code, type_name, interest_rate, min_balance, description) VALUES
('SAVINGS',       'Savings Account',       3.50, 1000.00,     'Regular savings account with interest'),
('CURRENT',       'Current Account',       0.00, 5000.00,     'Current account for business transactions'),
('FIXED_DEPOSIT', 'Fixed Deposit Account', 6.50, 10000.00,    'Fixed deposit with higher interest');

-- Loan Types
INSERT INTO loan_types(type_code, type_name, min_amount, max_amount, min_tenure_months, max_tenure_months, interest_rate, processing_fee_pct) VALUES
('PERSONAL',  'Personal Loan',   10000.00,  500000.00,  12, 60,  10.50, 1.00),
('HOME',      'Home Loan',      500000.00, 10000000.00, 60, 360,  8.50, 0.50),
('EDUCATION', 'Education Loan',  50000.00, 1500000.00,  12, 84,   9.00, 0.00);

-- Admin user (password: Admin@123)
INSERT INTO users(username, email, password_hash, first_name, last_name, phone, is_active, email_verified)
VALUES('admin', 'admin@bank.com',
       '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6rfk7vFuGi',
       'System', 'Admin', '9000000000', TRUE, TRUE);

-- Customer users (password: Customer@123)
INSERT INTO users(username, email, password_hash, first_name, last_name, phone, date_of_birth, gender, is_active, email_verified) VALUES
('rahul.sharma', 'rahul@email.com',
 '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LgZa3dLwC6m',
 'Rahul', 'Sharma', '9876543210', '1990-05-15', 'MALE', TRUE, TRUE),
('priya.patel', 'priya@email.com',
 '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LgZa3dLwC6m',
 'Priya', 'Patel', '9876543211', '1992-08-22', 'FEMALE', TRUE, TRUE),
('arjun.mehta', 'arjun@email.com',
 '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LgZa3dLwC6m',
 'Arjun', 'Mehta', '9876543212', '1988-12-10', 'MALE', TRUE, TRUE);

-- Employee user
INSERT INTO users(username, email, password_hash, first_name, last_name, phone, is_active, email_verified)
VALUES('emp.kumar', 'kumar@bank.com',
       '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6rfk7vFuGi',
       'Rajesh', 'Kumar', '9000000001', TRUE, TRUE);

-- Assign roles (user IDs 1=admin, 2=rahul, 3=priya, 4=arjun, 5=emp.kumar)
INSERT INTO user_roles(user_id, role_id) VALUES
(1, 2),  -- admin -> ROLE_ADMIN
(2, 1),  -- rahul -> ROLE_CUSTOMER
(3, 1),  -- priya -> ROLE_CUSTOMER
(4, 1),  -- arjun -> ROLE_CUSTOMER
(5, 3);  -- emp.kumar -> ROLE_EMPLOYEE

-- Employee
INSERT INTO employees(user_id, branch_id, employee_code, designation, department, joining_date, salary)
VALUES(5, 1, 'EMP001', 'Branch Manager', 'Operations', '2020-01-15', 75000.00);

-- KYC
INSERT INTO kyc_details(user_id, aadhaar_number, pan_number, address_line1, city, state, pincode, kyc_status, verified_at)
VALUES
(2, '123456789012', 'ABCDE1234F', '12 Green Park', 'New Delhi', 'Delhi', '110016', 'VERIFIED', NOW()),
(3, '234567890123', 'BCDEF2345G', '5 Andheri West', 'Mumbai', 'Maharashtra', '400058', 'VERIFIED', NOW()),
(4, '345678901234', 'CDEFG3456H', '8 Koramangala', 'Bangalore', 'Karnataka', '560034', 'SUBMITTED', NULL);

-- Accounts
INSERT INTO accounts(account_number, user_id, branch_id, account_type_id, balance, available_balance, status, opened_at) VALUES
('ACC1000000001', 2, 1, 1, 85000.00, 85000.00, 'ACTIVE', '2022-03-10'),
('ACC1000000002', 3, 1, 1, 42500.00, 42500.00, 'ACTIVE', '2022-05-20'),
('ACC1000000003', 4, 2, 2, 125000.00, 125000.00, 'ACTIVE', '2021-11-01'),
('ACC1000000004', 2, 1, 3, 100000.00, 100000.00, 'ACTIVE', '2023-01-15');

-- Fixed Deposit
INSERT INTO fixed_deposits(account_id, principal, interest_rate, tenure_months, maturity_amount, start_date, maturity_date, status)
VALUES(4, 100000.00, 6.50, 12, 106500.00, '2023-01-15', '2024-01-15', 'ACTIVE');

-- Sample transactions
INSERT INTO transactions(transaction_ref, from_account_id, to_account_id, transaction_type, amount,
    balance_before, balance_after, description, status, channel, initiated_at, completed_at)
VALUES
('TXN20240101000001', NULL, 1, 'DEPOSIT',    50000.00, 35000.00, 85000.00, 'Cash deposit', 'SUCCESS', 'BRANCH', '2024-01-01 10:00:00', '2024-01-01 10:00:05'),
('TXN20240110000002', 1, 2,    'TRANSFER',   10000.00, 85000.00, 75000.00, 'Rent payment', 'SUCCESS', 'NETBANKING', '2024-01-10 14:30:00', '2024-01-10 14:30:02'),
('TXN20240115000003', NULL, 2, 'DEPOSIT',    20000.00, 22500.00, 42500.00, 'Salary credit', 'SUCCESS', 'NEFT', '2024-01-15 09:00:00', '2024-01-15 09:00:10'),
('TXN20240120000004', 1, NULL, 'WITHDRAWAL', 5000.00,  75000.00, 70000.00, 'ATM withdrawal','SUCCESS','ATM', '2024-01-20 16:00:00', '2024-01-20 16:00:03');

-- Restore rahul's balance
UPDATE accounts SET balance = 85000.00, available_balance = 85000.00 WHERE id = 1;

-- UPI IDs
INSERT INTO upi_ids(user_id, account_id, upi_id, is_default, is_active)
VALUES
(2, 1, 'rahul.sharma@bank',  TRUE,  TRUE),
(3, 2, 'priya.patel@bank',   TRUE,  TRUE),
(4, 3, 'arjun.mehta@bank',   TRUE,  TRUE);

-- Beneficiaries
INSERT INTO beneficiaries(user_id, nickname, account_number, ifsc_code, bank_name, beneficiary_name)
VALUES
(2, 'Priya',  'ACC1000000002', 'BANK0000001', 'Our Bank', 'Priya Patel'),
(2, 'Arjun',  'ACC1000000003', 'BANK0000002', 'Our Bank', 'Arjun Mehta'),
(3, 'Rahul',  'ACC1000000001', 'BANK0000001', 'Our Bank', 'Rahul Sharma');

-- Loan application + loan for Rahul
INSERT INTO loan_applications(application_no, user_id, loan_type_id, account_id,
    amount_requested, tenure_months, purpose, annual_income, employment_type, employer_name,
    status, reviewed_by, reviewed_at, submitted_at)
VALUES('LOAN202400001', 2, 1, 1, 200000.00, 24, 'Home renovation', 720000.00,
    'SALARIED', 'Tech Corp Ltd', 'DISBURSED', 1, NOW(), NOW());

INSERT INTO loans(loan_account_number, application_id, user_id, principal_amount,
    interest_rate, tenure_months, emi_amount, processing_fee,
    outstanding_balance, disbursed_at, first_emi_date, last_emi_date, status)
VALUES('LACC000000001', 1, 2, 200000.00, 10.50, 24, 9298.47, 2000.00, 200000.00,
    '2024-01-01', '2024-02-01', '2026-01-01', 'ACTIVE');

CALL sp_generate_emi_schedule(1);

-- Notification templates
INSERT INTO notification_templates(code, subject, body, channel) VALUES
('WELCOME_EMAIL',       'Welcome to Our Bank!', 'Dear {name}, welcome aboard!', 'EMAIL'),
('TRANSACTION_ALERT',   'Transaction Alert',    'A transaction of ₹{amount} was made on your account.', 'EMAIL'),
('LOGIN_ALERT',         'New Login Detected',   'New login detected from {ip} on {time}.', 'EMAIL'),
('LOW_BALANCE',         'Low Balance Alert',    'Your balance is below ₹1,000.', 'EMAIL'),
('LOAN_APPROVED',       'Loan Approved!',       'Your loan of ₹{amount} has been approved.', 'EMAIL'),
('EMI_REMINDER',        'EMI Due Tomorrow',     'Your EMI of ₹{amount} is due tomorrow.', 'SMS');

-- Sample card for Rahul
INSERT INTO cards(card_number, user_id, account_id, card_type, card_network, card_holder_name,
    expiry_month, expiry_year, cvv_hash, pin_hash, status, activated_at)
VALUES('XXXXXXXXXXXX1234', 2, 1, 'DEBIT', 'RUPAY', 'RAHUL SHARMA',
    12, 2027,
    '$2a$12$hashofcvv',
    '$2a$12$hashofpin',
    'ACTIVE', NOW());
