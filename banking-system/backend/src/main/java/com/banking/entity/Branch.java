package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity @Table(name = "branches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Branch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "branch_code", unique = true, nullable = false, length = 20)
    private String branchCode;

    @Column(name = "branch_name", nullable = false, length = 100)
    private String branchName;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 80)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    private String phone;
    private String email;

    @Column(name = "ifsc_code", unique = true, nullable = false, length = 15)
    private String ifscCode;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;
}
