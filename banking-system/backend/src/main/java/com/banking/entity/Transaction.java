package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_ref", unique = true, nullable = false, length = 30)
    private String transactionRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_account_id")
    private Account fromAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_account_id")
    private Account toAccount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(length = 5)
    private String currency = "INR";

    @Column(name = "balance_before", precision = 15, scale = 2)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", precision = 15, scale = 2)
    private BigDecimal balanceAfter;

    @Column(length = 300)
    private String description;

    @Column(length = 300)
    private String remarks;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status = TransactionStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private Channel channel = Channel.NETBANKING;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "failure_reason", length = 300)
    private String failureReason;

    @Column(name = "initiated_at")
    private LocalDateTime initiatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp private LocalDateTime createdAt;

    public enum TransactionType {
        DEPOSIT, WITHDRAWAL, TRANSFER, UPI_CREDIT, UPI_DEBIT,
        EMI_DEBIT, INTEREST_CREDIT, CHARGE, REVERSAL
    }
    public enum TransactionStatus { PENDING, PROCESSING, SUCCESS, FAILED, REVERSED }
    public enum Channel { NETBANKING, MOBILE, ATM, BRANCH, UPI, NEFT, RTGS, IMPS }
}
