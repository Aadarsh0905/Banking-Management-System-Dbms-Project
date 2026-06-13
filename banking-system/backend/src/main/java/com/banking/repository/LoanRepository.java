package com.banking.repository;

import com.banking.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LoanRepository extends JpaRepository<Loan, Long> {
    List<Loan> findByUserId(Long userId);
    long countByStatus(Loan.LoanStatus status);
    Optional<Loan> findByLoanAccountNumber(String loanAccountNumber);

    @Query("SELECT l FROM Loan l WHERE l.user.id = :userId AND l.status = 'ACTIVE'")
    List<Loan> findActiveLoansByUser(@Param("userId") Long userId);
}
