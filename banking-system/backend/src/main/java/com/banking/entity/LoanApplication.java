package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "loan_applications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_no", unique = true, nullable = false, length = 20)
    private String applicationNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_type_id", nullable = false)
    private LoanType loanType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "amount_requested", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountRequested;

    @Column(name = "tenure_months", nullable = false)
    private Integer tenureMonths;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Column(name = "annual_income", precision = 15, scale = 2)
    private BigDecimal annualIncome;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type")
    private EmploymentType employmentType;

    @Column(name = "employer_name", length = 200)
    private String employerName;

    @Enumerated(EnumType.STRING)
    private LoanApplicationStatus status = LoanApplicationStatus.DRAFT;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "review_remarks", columnDefinition = "TEXT")
    private String reviewRemarks;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum EmploymentType { SALARIED, SELF_EMPLOYED, BUSINESS, OTHER }
    public enum LoanApplicationStatus { DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, DISBURSED, CLOSED }
}
