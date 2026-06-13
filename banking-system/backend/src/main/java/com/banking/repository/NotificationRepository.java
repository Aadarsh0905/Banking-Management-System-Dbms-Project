package com.banking.repository;

import com.banking.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    long countByUserIdAndStatus(Long userId, Notification.NotificationStatus status);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :uid AND n.status = 'PENDING' ORDER BY n.createdAt DESC")
    List<Notification> findPendingByUser(@Param("uid") Long userId);
}
