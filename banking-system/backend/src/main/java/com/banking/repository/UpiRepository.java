package com.banking.repository;

import com.banking.entity.UpiId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UpiRepository extends JpaRepository<UpiId, Long> {
    List<UpiId> findByUserId(Long userId);
    Optional<UpiId> findByUpiId(String upiId);
    boolean existsByUpiId(String upiId);
    List<UpiId> findByUserIdAndIsActiveTrue(Long userId);
}
