package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity @Table(name = "kyc_details")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class KycDetails {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "aadhaar_number", unique = true, length = 20)
    private String aadhaarNumber;

    @Column(name = "pan_number", unique = true, length = 15)
    private String panNumber;

    @Column(name = "address_line1", nullable = false)
    private String addressLine1;

    private String addressLine2;

    @Column(nullable = false, length = 80)
    private String city;

    @Column(nullable = false, length = 80)
    private String state;

    @Column(nullable = false, length = 10)
    private String pincode;

    private String country = "India";

    @Enumerated(EnumType.STRING)
    @Column(name = "kyc_status")
    private KycStatus kycStatus = KycStatus.PENDING;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @ManyToOne @JoinColumn(name = "verified_by")
    private User verifiedBy;

    private String remarks;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum KycStatus { PENDING, SUBMITTED, VERIFIED, REJECTED }
}
