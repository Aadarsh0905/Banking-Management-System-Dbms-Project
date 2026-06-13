package com.banking.repository;

import com.banking.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUserIdAndIsActiveTrue(Long userId);
    Optional<Beneficiary> findByUserIdAndAccountNumber(Long userId, String accountNumber);
    boolean existsByUserIdAndAccountNumber(Long userId, String accountNumber);
}
