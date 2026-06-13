package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

// ============================================================
// ScheduledTransfer Entity (missing from Entities.java)
// ============================================================
@Entity
@Table(name = "scheduled_transfers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ScheduledTransfer {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id", nullable = false)
    private Account fromAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id", nullable = false)
    private Account toAccount;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    private Frequency frequency;

    @Column(name = "next_execution_date", nullable = false)
    private LocalDate nextExecutionDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private TransferStatus status = TransferStatus.ACTIVE;

    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Frequency { ONCE, DAILY, WEEKLY, MONTHLY }
    public enum TransferStatus { ACTIVE, PAUSED, COMPLETED, FAILED }
}
