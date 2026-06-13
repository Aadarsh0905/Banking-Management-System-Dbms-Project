package com.banking.repository;

import com.banking.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    Optional<Account> findByAccountNumber(String accountNumber);
    List<Account> findByUserIdAndStatus(Long userId, Account.AccountStatus status);
    long countByStatus(Account.AccountStatus status);

    @Query("SELECT a FROM Account a WHERE a.user.id = :userId AND a.status = 'ACTIVE'")
    List<Account> findActiveAccountsByUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Account a WHERE DATE(a.createdAt) = CURRENT_DATE")
    long countOpenedToday();

    @Query("SELECT COUNT(a) FROM Account a WHERE a.openedAt BETWEEN :from AND :to")
    long countOpenedBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByTransactionRef(String ref);

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId)
          AND t.status = 'SUCCESS'
          AND t.initiatedAt BETWEEN :from AND :to
        ORDER BY t.initiatedAt DESC
    """)
    Page<Transaction> findByAccountAndDateRange(
        @Param("accountId") Long accountId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable);

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId)
        ORDER BY t.initiatedAt DESC
    """)
    Page<Transaction> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE DATE(t.initiatedAt) = CURRENT_DATE AND t.status = 'SUCCESS'")
    long countTodaySuccess();

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t WHERE DATE(t.initiatedAt) = CURRENT_DATE AND t.status='SUCCESS'")
    BigDecimal sumTodayAmount();

    @Query("""
        SELECT t FROM Transaction t
        WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId)
          AND (:type IS NULL OR t.transactionType = :type)
          AND (:status IS NULL OR t.status = :status)
          AND (:from IS NULL OR t.initiatedAt >= :from)
          AND (:to IS NULL OR t.initiatedAt <= :to)
        ORDER BY t.initiatedAt DESC
    """)
    Page<Transaction> searchTransactions(
        @Param("userId") Long userId,
        @Param("type") Transaction.TransactionType type,
        @Param("status") Transaction.TransactionStatus status,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.initiatedAt BETWEEN :from AND :to AND t.status = 'SUCCESS'")
    long countByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
           "WHERE t.initiatedAt BETWEEN :from AND :to AND t.status = 'SUCCESS'")
    BigDecimal sumByDateRange(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COUNT(ct) FROM CardTransaction ct WHERE ct.card.id = :cardId")
    long countByCardId(@Param("cardId") Long cardId);

    @Query("SELECT t FROM Transaction t " +
           "WHERE (t.fromAccount.user.id = :userId OR t.toAccount.user.id = :userId) " +
           "AND t.transactionType IN ('UPI_CREDIT', 'UPI_DEBIT') " +
           "ORDER BY t.initiatedAt DESC")
    Page<Transaction> findUpiByUserId(@Param("userId") Long userId, Pageable pageable);
}

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByUserId(Long userId);
    Page<LoanApplication> findByStatus(LoanApplication.LoanApplicationStatus status, Pageable pageable);
    long countByStatus(LoanApplication.LoanApplicationStatus status);
    Optional<LoanApplication> findByApplicationNo(String applicationNo);
}

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    long countByStatus(Loan.LoanStatus status);
    Optional<Loan> findByLoanAccountNumber(String loanAccountNumber);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    List<Loan> findActiveLoansByUser(@Param("userId") Long userId);
}

public interface EmiScheduleRepository extends JpaRepository<EmiSchedule, Long> {
    List<EmiSchedule> findByLoanIdOrderByEmiNumber(Long loanId);
    List<EmiSchedule> findByLoanIdAndStatus(Long loanId, EmiSchedule.EmiStatus status);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate = :date AND e.status = 'UPCOMING'")
    List<EmiSchedule> findDueOn(@Param("date") LocalDate date);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate = :date AND e.status = 'UPCOMING' AND e.loan.user.id = :userId")
    List<EmiSchedule> findUpcomingEmiForUser(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate < :date AND e.status = 'UPCOMING'")
    List<EmiSchedule> findByDueDateBeforeAndStatus(
        @Param("date") LocalDate date,
        @Param("status") EmiSchedule.EmiStatus status);
}

public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Long> {
    List<ScheduledTransfer> findByFromAccountUserId(Long userId);
    List<ScheduledTransfer> findByStatusAndNextExecutionDate(ScheduledTransfer.TransferStatus status, LocalDate date);

    @Query("SELECT s FROM ScheduledTransfer s WHERE s.status = 'ACTIVE' AND s.nextExecutionDate <= :today")
    List<ScheduledTransfer> findDueTransfers(@Param("today") LocalDate today);
}

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByUserId(Long userId);
    Optional<Card> findByCardNumber(String cardNumber);
    List<Card> findByUserIdAndCardType(Long userId, Card.CardType cardType);
    boolean existsByUserIdAndCardTypeAndStatusNot(Long userId, Card.CardType type, Card.CardStatus status);
}

public interface UpiRepository extends JpaRepository<UpiId, Long> {
    List<UpiId> findByUserId(Long userId);
    Optional<UpiId> findByUpiId(String upiId);
    boolean existsByUpiId(String upiId);
    List<UpiId> findByUserIdAndIsActiveTrue(Long userId);
}

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndStatus(Long userId, Notification.NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :uid AND n.status = 'PENDING' ORDER BY n.createdAt DESC")
    List<Notification> findPendingByUser(@Param("uid") Long userId);
}

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUserIdAndIsActiveTrue(Long userId);
    Optional<Beneficiary> findByUserIdAndAccountNumber(Long userId, String accountNumber);
    boolean existsByUserIdAndAccountNumber(Long userId, String accountNumber);
}

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :type AND a.entityId = :id ORDER BY a.createdAt DESC")
    List<AuditLog> findByEntity(@Param("type") String type, @Param("id") String id);
}

public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {
    List<LoanType> findByIsActiveTrue();
    Optional<LoanType> findByTypeCode(String typeCode);
}

public interface AccountTypeRepository extends JpaRepository<AccountType, Long> {
    List<AccountType> findByIsActiveTrue();
    Optional<AccountType> findByTypeCode(String typeCode);
}

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByIsActiveTrue();
    Optional<Branch> findByIfscCode(String ifscCode);
    Optional<Branch> findByBranchCode(String branchCode);
}

public interface KycRepository extends JpaRepository<KycDetails, Long> {
    Optional<KycDetails> findByUserId(Long userId);
    Page<KycDetails> findByKycStatus(KycDetails.KycStatus status, Pageable pageable);
    long countByKycStatus(KycDetails.KycStatus status);
}
