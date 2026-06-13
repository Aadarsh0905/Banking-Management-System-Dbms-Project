package com.banking.repository;

import com.banking.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

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
