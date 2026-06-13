package com.banking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "card_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CardTransaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private Card card;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    private Transaction transaction;

    @Column(name = "merchant_name", length = 200)
    private String merchantName;

    @Column(name = "merchant_category", length = 100)
    private String merchantCategory;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
