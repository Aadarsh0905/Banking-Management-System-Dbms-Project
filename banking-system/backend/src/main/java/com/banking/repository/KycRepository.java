package com.banking.repository;

import com.banking.entity.KycDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface KycRepository extends JpaRepository<KycDetails, Long> {
    Optional<KycDetails> findByUserId(Long userId);
    Page<KycDetails> findByKycStatus(KycDetails.KycStatus status, Pageable pageable);
    long countByKycStatus(KycDetails.KycStatus status);
}
