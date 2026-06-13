package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity @Table(name = "beneficiaries")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Beneficiary {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Column(name = "account_number", nullable = false, length = 20)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 15)
    private String ifscCode;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "beneficiary_name", nullable = false, length = 100)
    private String beneficiaryName;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp private LocalDateTime createdAt;
}
