package com.banking.repository;

import com.banking.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :type AND a.entityId = :id ORDER BY a.createdAt DESC")
    List<AuditLog> findByEntity(@Param("type") String type, @Param("id") String id);
}
