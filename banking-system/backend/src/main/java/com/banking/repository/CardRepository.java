package com.banking.repository;

import com.banking.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CardRepository extends JpaRepository<Card, Long> {
    @Query("SELECT c FROM Card c JOIN FETCH c.user JOIN FETCH c.account WHERE c.user.id = :userId")
    List<Card> findByUserId(@Param("userId") Long userId);

    Optional<Card> findByCardNumber(String cardNumber);

    List<Card> findByUserIdAndCardType(Long userId, Card.CardType cardType);

    boolean existsByUserIdAndCardTypeAndStatusNot(Long userId, Card.CardType type, Card.CardStatus status);

    @Query("SELECT c FROM Card c JOIN FETCH c.user JOIN FETCH c.account WHERE c.status = :status")
    List<Card> findByStatus(@Param("status") Card.CardStatus status);

    boolean existsByCardNumber(String cardNumber);
}
