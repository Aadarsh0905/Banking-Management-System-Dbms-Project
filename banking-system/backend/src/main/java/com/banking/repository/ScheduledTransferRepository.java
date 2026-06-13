package com.banking.repository;

import com.banking.entity.ScheduledTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduledTransferRepository extends JpaRepository<ScheduledTransfer, Long> {
    List<ScheduledTransfer> findByFromAccountUserId(Long userId);
    List<ScheduledTransfer> findByStatusAndNextExecutionDate(ScheduledTransfer.TransferStatus status, LocalDate date);

    @Query("SELECT s FROM ScheduledTransfer s WHERE s.status = 'ACTIVE' AND s.nextExecutionDate <= :today")
    List<ScheduledTransfer> findDueTransfers(@Param("today") LocalDate today);
}
