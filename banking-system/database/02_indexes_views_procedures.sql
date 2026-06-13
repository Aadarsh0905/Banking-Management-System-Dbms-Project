USE banking_db;

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE INDEX idx_users_email       ON users(email);
CREATE INDEX idx_users_phone       ON users(phone);
CREATE INDEX idx_users_is_active   ON users(is_active);

-- accounts
CREATE INDEX idx_accounts_user         ON accounts(user_id);
CREATE INDEX idx_accounts_status       ON accounts(status);
CREATE INDEX idx_accounts_branch       ON accounts(branch_id);
CREATE INDEX idx_accounts_number       ON accounts(account_number);

-- transactions
CREATE INDEX idx_txn_from_account  ON transactions(from_account_id);
CREATE INDEX idx_txn_to_account    ON transactions(to_account_id);
CREATE INDEX idx_txn_status        ON transactions(status);
CREATE INDEX idx_txn_type          ON transactions(transaction_type);
CREATE INDEX idx_txn_initiated     ON transactions(initiated_at);
CREATE INDEX idx_txn_ref           ON transactions(transaction_ref);

-- loans
CREATE INDEX idx_loans_user        ON loans(user_id);
CREATE INDEX idx_loans_status      ON loans(status);
CREATE INDEX idx_loan_app_user     ON loan_applications(user_id);
CREATE INDEX idx_loan_app_status   ON loan_applications(status);

-- emi
CREATE INDEX idx_emi_loan          ON emi_schedule(loan_id);
CREATE INDEX idx_emi_due_date      ON emi_schedule(due_date);
CREATE INDEX idx_emi_status        ON emi_schedule(status);

-- cards
CREATE INDEX idx_cards_user        ON cards(user_id);
CREATE INDEX idx_cards_account     ON cards(account_id);
CREATE INDEX idx_cards_status      ON cards(status);

-- notifications
CREATE INDEX idx_notif_user        ON notifications(user_id);
CREATE INDEX idx_notif_status      ON notifications(status);

-- audit
CREATE INDEX idx_audit_user        ON audit_logs(user_id);
CREATE INDEX idx_audit_entity      ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created     ON audit_logs(created_at);

-- upi
CREATE INDEX idx_upi_user          ON upi_ids(user_id);

-- ============================================================
-- VIEWS
-- ============================================================

-- Account summary view
CREATE OR REPLACE VIEW vw_account_summary AS
SELECT
    a.id                AS account_id,
    a.account_number,
    u.id                AS user_id,
    CONCAT(u.first_name,' ',u.last_name) AS account_holder,
    u.email,
    u.phone,
    at.type_name        AS account_type,
    b.branch_name,
    b.ifsc_code,
    a.balance,
    a.available_balance,
    a.status,
    a.opened_at,
    a.last_transaction_at
FROM accounts a
JOIN users u         ON a.user_id = u.id
JOIN account_types at ON a.account_type_id = at.id
JOIN branches b      ON a.branch_id = b.id;

-- Transaction history view
CREATE OR REPLACE VIEW vw_transaction_history AS
SELECT
    t.id,
    t.transaction_ref,
    t.transaction_type,
    t.amount,
    t.currency,
    t.status,
    t.channel,
    t.description,
    t.initiated_at,
    t.completed_at,
    fa.account_number   AS from_account,
    ta.account_number   AS to_account,
    CONCAT(fu.first_name,' ',fu.last_name) AS from_user,
    CONCAT(tu.first_name,' ',tu.last_name) AS to_user
FROM transactions t
LEFT JOIN accounts fa ON t.from_account_id = fa.id
LEFT JOIN accounts ta ON t.to_account_id   = ta.id
LEFT JOIN users    fu ON fa.user_id = fu.id
LEFT JOIN users    tu ON ta.user_id = tu.id;

-- Loan summary view
CREATE OR REPLACE VIEW vw_loan_summary AS
SELECT
    l.id                AS loan_id,
    l.loan_account_number,
    CONCAT(u.first_name,' ',u.last_name) AS borrower_name,
    lt.type_name        AS loan_type,
    l.principal_amount,
    l.interest_rate,
    l.tenure_months,
    l.emi_amount,
    l.outstanding_balance,
    l.disbursed_at,
    l.last_emi_date,
    l.status,
    COUNT(e.id)         AS total_emis,
    SUM(CASE WHEN e.status='PAID' THEN 1 ELSE 0 END) AS paid_emis,
    SUM(CASE WHEN e.status='OVERDUE' THEN 1 ELSE 0 END) AS overdue_emis
FROM loans l
JOIN users u                ON l.user_id = u.id
JOIN loan_applications la   ON l.application_id = la.id
JOIN loan_types lt          ON la.loan_type_id = lt.id
LEFT JOIN emi_schedule e    ON l.id = e.loan_id
GROUP BY l.id, l.loan_account_number, borrower_name, lt.type_name,
         l.principal_amount, l.interest_rate, l.tenure_months, l.emi_amount,
         l.outstanding_balance, l.disbursed_at, l.last_emi_date, l.status;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- Generate unique account number
CREATE PROCEDURE sp_generate_account_number(OUT acc_number VARCHAR(20))
BEGIN
    DECLARE new_num VARCHAR(20);
    DECLARE done INT DEFAULT 0;
    REPEAT
        SET new_num = CONCAT('ACC', LPAD(FLOOR(RAND()*9000000000)+1000000000, 10, '0'));
        SELECT COUNT(*) INTO done FROM accounts WHERE account_number = new_num;
    UNTIL done = 0 END REPEAT;
    SET acc_number = new_num;
END$$

-- Process fund transfer (atomic)
CREATE PROCEDURE sp_fund_transfer(
    IN p_from_account_id   BIGINT,
    IN p_to_account_id     BIGINT,
    IN p_amount            DECIMAL(15,2),
    IN p_description       VARCHAR(300),
    IN p_channel           VARCHAR(20),
    IN p_ip_address        VARCHAR(45),
    OUT p_txn_ref          VARCHAR(30),
    OUT p_status           VARCHAR(20),
    OUT p_message          VARCHAR(300)
)
BEGIN
    DECLARE from_balance    DECIMAL(15,2);
    DECLARE from_avail      DECIMAL(15,2);
    DECLARE from_version    INT;
    DECLARE from_status     VARCHAR(20);
    DECLARE to_status       VARCHAR(20);
    DECLARE txn_ref         VARCHAR(30);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status  = 'FAILED';
        SET p_message = 'Transaction failed due to internal error';
    END;

    -- Validate amount
    IF p_amount <= 0 THEN
        SET p_status = 'FAILED';
        SET p_message = 'Amount must be greater than zero';
        LEAVE;
    END IF;

    START TRANSACTION;

    -- Lock source account
    SELECT balance, available_balance, version, status
    INTO from_balance, from_avail, from_version, from_status
    FROM accounts WHERE id = p_from_account_id FOR UPDATE;

    SELECT status INTO to_status FROM accounts WHERE id = p_to_account_id FOR UPDATE;

    IF from_status != 'ACTIVE' THEN
        ROLLBACK;
        SET p_status = 'FAILED'; SET p_message = 'Source account is not active'; LEAVE;
    END IF;
    IF to_status != 'ACTIVE' THEN
        ROLLBACK;
        SET p_status = 'FAILED'; SET p_message = 'Destination account is not active'; LEAVE;
    END IF;
    IF from_avail < p_amount THEN
        ROLLBACK;
        SET p_status = 'FAILED'; SET p_message = 'Insufficient balance'; LEAVE;
    END IF;

    SET txn_ref = CONCAT('TXN', DATE_FORMAT(NOW(),'%Y%m%d'), LPAD(FLOOR(RAND()*999999), 6, '0'));

    INSERT INTO transactions(transaction_ref, from_account_id, to_account_id,
        transaction_type, amount, balance_before, balance_after,
        description, status, channel, ip_address, initiated_at, completed_at)
    VALUES(txn_ref, p_from_account_id, p_to_account_id,
        'TRANSFER', p_amount, from_balance, from_balance - p_amount,
        p_description, 'SUCCESS', p_channel, p_ip_address, NOW(), NOW());

    UPDATE accounts
    SET balance = balance - p_amount,
        available_balance = available_balance - p_amount,
        last_transaction_at = NOW(),
        version = version + 1
    WHERE id = p_from_account_id AND version = from_version;

    IF ROW_COUNT() = 0 THEN
        ROLLBACK;
        SET p_status = 'FAILED'; SET p_message = 'Concurrent modification detected'; LEAVE;
    END IF;

    UPDATE accounts
    SET balance = balance + p_amount,
        available_balance = available_balance + p_amount,
        last_transaction_at = NOW()
    WHERE id = p_to_account_id;

    COMMIT;
    SET p_txn_ref = txn_ref;
    SET p_status  = 'SUCCESS';
    SET p_message = 'Transfer completed successfully';
END$$

-- Calculate EMI schedule
CREATE PROCEDURE sp_generate_emi_schedule(IN p_loan_id BIGINT)
BEGIN
    DECLARE v_principal     DECIMAL(15,2);
    DECLARE v_rate          DECIMAL(5,2);
    DECLARE v_tenure        INT;
    DECLARE v_emi           DECIMAL(12,2);
    DECLARE v_start_date    DATE;
    DECLARE v_balance       DECIMAL(15,2);
    DECLARE v_month_rate    DECIMAL(10,8);
    DECLARE v_interest      DECIMAL(12,2);
    DECLARE v_principal_c   DECIMAL(12,2);
    DECLARE v_i             INT DEFAULT 1;

    SELECT principal_amount, interest_rate, tenure_months, emi_amount, first_emi_date
    INTO v_principal, v_rate, v_tenure, v_emi, v_start_date
    FROM loans WHERE id = p_loan_id;

    SET v_balance    = v_principal;
    SET v_month_rate = v_rate / (12 * 100);

    WHILE v_i <= v_tenure DO
        SET v_interest    = ROUND(v_balance * v_month_rate, 2);
        SET v_principal_c = ROUND(v_emi - v_interest, 2);
        IF v_i = v_tenure THEN
            SET v_principal_c = v_balance;
            SET v_emi         = v_balance + v_interest;
        END IF;
        SET v_balance = v_balance - v_principal_c;

        INSERT INTO emi_schedule(loan_id, emi_number, due_date, emi_amount,
            principal_component, interest_component, outstanding_after, status)
        VALUES(p_loan_id, v_i,
            DATE_ADD(v_start_date, INTERVAL (v_i-1) MONTH),
            ROUND(v_emi, 2),
            v_principal_c,
            v_interest,
            GREATEST(0, ROUND(v_balance, 2)),
            'UPCOMING');

        SET v_i = v_i + 1;
    END WHILE;
END$$

-- Account statement report
CREATE PROCEDURE sp_account_statement(
    IN p_account_id BIGINT,
    IN p_from_date  DATE,
    IN p_to_date    DATE
)
BEGIN
    SELECT
        t.transaction_ref,
        t.initiated_at,
        t.transaction_type,
        t.description,
        CASE WHEN t.to_account_id = p_account_id THEN t.amount ELSE NULL END   AS credit,
        CASE WHEN t.from_account_id = p_account_id THEN t.amount ELSE NULL END AS debit,
        CASE WHEN t.to_account_id = p_account_id
             THEN t.balance_after
             ELSE t.balance_before - t.amount END                               AS running_balance,
        t.status,
        t.channel
    FROM transactions t
    WHERE (t.from_account_id = p_account_id OR t.to_account_id = p_account_id)
      AND t.status = 'SUCCESS'
      AND DATE(t.initiated_at) BETWEEN p_from_date AND p_to_date
    ORDER BY t.initiated_at;
END$$

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

-- Audit trigger: account updates
CREATE TRIGGER trg_account_audit_update
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs(entity_type, entity_id, action, old_value, new_value)
    VALUES('ACCOUNT', OLD.id, 'UPDATE',
        JSON_OBJECT('balance', OLD.balance, 'status', OLD.status),
        JSON_OBJECT('balance', NEW.balance, 'status', NEW.status));
END$$

-- Auto-lock user after 5 failed logins
CREATE TRIGGER trg_lock_user_on_failed_login
AFTER INSERT ON login_attempts
FOR EACH ROW
BEGIN
    DECLARE failed_count INT;
    IF NEW.success = FALSE THEN
        SELECT COUNT(*) INTO failed_count
        FROM login_attempts
        WHERE username = NEW.username
          AND success = FALSE
          AND attempted_at > DATE_SUB(NOW(), INTERVAL 30 MINUTE);
        IF failed_count >= 5 THEN
            UPDATE users SET is_locked = TRUE, failed_login_count = failed_count
            WHERE username = NEW.username OR email = NEW.username;
        END IF;
    ELSE
        UPDATE users SET failed_login_count = 0 WHERE username = NEW.username OR email = NEW.username;
    END IF;
END$$

-- Low balance alert
CREATE TRIGGER trg_low_balance_notification
AFTER UPDATE ON accounts
FOR EACH ROW
BEGIN
    IF NEW.balance < 1000 AND OLD.balance >= 1000 THEN
        INSERT INTO notifications(user_id, title, message, channel, status)
        VALUES(NEW.user_id,
               'Low Balance Alert',
               CONCAT('Your account ', NEW.account_number, ' balance has fallen below ₹1,000. Current balance: ₹', NEW.balance),
               'IN_APP', 'PENDING');
    END IF;
END$$

-- Mark EMI as overdue
CREATE EVENT evt_mark_emi_overdue
ON SCHEDULE EVERY 1 DAY STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE emi_schedule
    SET status = 'OVERDUE'
    WHERE status = 'UPCOMING'
      AND due_date < CURDATE();
END$$

DELIMITER ;
