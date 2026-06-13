package com.banking.repository;

import com.banking.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByUserId(Long userId);
    Optional<Card> findByCardNumber(String cardNumber);
    List<Card> findByUserIdAndCardType(Long userId, Card.CardType cardType);
    boolean existsByUserIdAndCardTypeAndStatusNot(Long userId, Card.CardType type, Card.CardStatus status);
}
