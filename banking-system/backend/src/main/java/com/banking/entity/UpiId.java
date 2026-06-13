package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity @Table(name = "upi_ids")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UpiId {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "upi_id", unique = true, nullable = false, length = 100)
    private String upiId;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @CreationTimestamp private LocalDateTime createdAt;
}
