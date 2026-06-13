package com.banking.repository;

import com.banking.entity.LoanApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanApplicationRepository extends JpaRepository<LoanApplication, Long> {
    List<LoanApplication> findByUserId(Long userId);
    Page<LoanApplication> findByStatus(LoanApplication.LoanApplicationStatus status, Pageable pageable);
    long countByStatus(LoanApplication.LoanApplicationStatus status);
    Optional<LoanApplication> findByApplicationNo(String applicationNo);
}
