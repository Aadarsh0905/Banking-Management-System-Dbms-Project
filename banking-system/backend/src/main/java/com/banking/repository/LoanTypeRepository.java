package com.banking.repository;

import com.banking.entity.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {
    List<LoanType> findByIsActiveTrue();
    Optional<LoanType> findByTypeCode(String typeCode);
}
