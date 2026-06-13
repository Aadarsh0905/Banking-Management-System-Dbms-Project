package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "cards")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Card {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "card_number", unique = true, nullable = false, length = 20)
    private String cardNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_network")
    private CardNetwork cardNetwork = CardNetwork.RUPAY;

    @Column(name = "card_holder_name", nullable = false, length = 100)
    private String cardHolderName;

    @Column(name = "expiry_month", nullable = false)
    private Integer expiryMonth;

    @Column(name = "expiry_year", nullable = false)
    private Integer expiryYear;

    @Column(name = "cvv_hash", nullable = false)
    private String cvvHash;

    @Column(name = "pin_hash")
    private String pinHash;

    @Column(name = "credit_limit", precision = 12, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "outstanding_balance", precision = 12, scale = 2)
    private BigDecimal outstandingBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private CardStatus status = CardStatus.REQUESTED;

    @Column(name = "is_international_enabled")
    private Boolean isInternationalEnabled = false;

    @Column(name = "is_online_enabled")
    private Boolean isOnlineEnabled = true;

    @Column(name = "is_contactless_enabled")
    private Boolean isContactlessEnabled = true;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    @Column(name = "blocked_at")
    private LocalDateTime blockedAt;

    @Column(name = "block_reason", length = 200)
    private String blockReason;

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp   private LocalDateTime updatedAt;

    public enum CardType { DEBIT, CREDIT }
    public enum CardNetwork { VISA, MASTERCARD, RUPAY }
    public enum CardStatus { REQUESTED, ACTIVE, BLOCKED, EXPIRED, CANCELLED }
}
