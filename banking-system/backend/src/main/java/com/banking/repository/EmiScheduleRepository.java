package com.banking.repository;

import com.banking.entity.EmiSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EmiScheduleRepository extends JpaRepository<EmiSchedule, Long> {
    List<EmiSchedule> findByLoanIdOrderByEmiNumber(Long loanId);
    List<EmiSchedule> findByLoanIdAndStatus(Long loanId, EmiSchedule.EmiStatus status);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate = :date AND e.status = 'UPCOMING'")
    List<EmiSchedule> findDueOn(@Param("date") LocalDate date);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate = :date AND e.status = 'UPCOMING' AND e.loan.user.id = :userId")
    List<EmiSchedule> findUpcomingEmiForUser(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT e FROM EmiSchedule e WHERE e.dueDate < :date AND e.status = 'UPCOMING'")
    List<EmiSchedule> findByDueDateBeforeAndStatus(
        @Param("date") LocalDate date,
        @Param("status") EmiSchedule.EmiStatus status);
}
