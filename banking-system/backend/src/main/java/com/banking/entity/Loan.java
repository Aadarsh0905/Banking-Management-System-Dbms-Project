package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity @Table(name = "loans")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Loan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "loan_account_number", unique = true, nullable = false, length = 20)
    private String loanAccountNumber;

    @OneToOne @JoinColumn(name = "application_id", unique = true, nullable = false)
    private LoanApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "principal_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal principalAmount;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(name = "emi_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal emiAmount;

    @Column(name = "processing_fee", precision = 12, scale = 2)
    private BigDecimal processingFee = BigDecimal.ZERO;

    @Column(name = "outstanding_balance", nullable = false, precision = 15, scale = 2)
    private BigDecimal outstandingBalance;

    @Column(name = "disbursed_at", nullable = false)
    private LocalDate disbursedAt;

    @Column(name = "first_emi_date", nullable = false)
    private LocalDate firstEmiDate;

    @Column(name = "last_emi_date", nullable = false)
    private LocalDate lastEmiDate;

    @Enumerated(EnumType.STRING)
    private LoanStatus status = LoanStatus.ACTIVE;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL)
    private List<EmiSchedule> emiSchedules = new ArrayList<>();

    @CreationTimestamp private LocalDateTime createdAt;

    public enum LoanStatus { ACTIVE, CLOSED, DEFAULTED, NPA }
}
