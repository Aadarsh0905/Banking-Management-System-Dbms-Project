package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name = "loan_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoanType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_code", unique = true, nullable = false, length = 30)
    private String typeCode;

    @Column(name = "type_name", nullable = false, length = 80)
    private String typeName;

    @Column(name = "min_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "min_tenure_months", nullable = false)
    private Integer minTenureMonths;

    @Column(name = "max_tenure_months", nullable = false)
    private Integer maxTenureMonths;

    @Column(name = "interest_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal interestRate;

    @Column(name = "processing_fee_pct", precision = 5, scale = 2)
    private BigDecimal processingFeePct = BigDecimal.ZERO;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
