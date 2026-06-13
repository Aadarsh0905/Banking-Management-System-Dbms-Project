package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity @Table(name = "account_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AccountType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_code", unique = true, nullable = false, length = 30)
    private String typeCode;

    @Column(name = "type_name", nullable = false, length = 80)
    private String typeName;

    @Column(name = "interest_rate", precision = 5, scale = 2)
    private BigDecimal interestRate = BigDecimal.ZERO;

    @Column(name = "min_balance", precision = 12, scale = 2)
    private BigDecimal minBalance = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;
}
