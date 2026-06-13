package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "emi_schedule")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmiSchedule {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id", nullable = false)
    private Loan loan;

    @Column(name = "emi_number", nullable = false)
    private Integer emiNumber;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "emi_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal emiAmount;

    @Column(name = "principal_component", nullable = false, precision = 12, scale = 2)
    private BigDecimal principalComponent;

    @Column(name = "interest_component", nullable = false, precision = 12, scale = 2)
    private BigDecimal interestComponent;

    @Column(name = "outstanding_after", nullable = false, precision = 15, scale = 2)
    private BigDecimal outstandingAfter;

    @Column(name = "paid_amount", precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private EmiStatus status = EmiStatus.UPCOMING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private Transaction transaction;

    public enum EmiStatus { UPCOMING, PAID, OVERDUE, PARTIAL }
}
