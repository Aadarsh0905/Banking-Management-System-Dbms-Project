package com.banking.repository;

import com.banking.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

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
