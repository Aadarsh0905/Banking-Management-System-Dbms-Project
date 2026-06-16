package com.banking.service;

import com.banking.dto.CardRequest;
import com.banking.dto.CardResponse;
import com.banking.dto.SetPinRequest;
import com.banking.entity.Account;
import com.banking.entity.Card;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.CardRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
@Transactional(readOnly = true)
public class CardService {
    private final CardRepository cardRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CardResponse requestCard(Long userId, CardRequest req) {
        Account acc = accountRepo.findByIdWithAssociations(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);

        Card.CardType cardType = Card.CardType.valueOf(req.cardType);
        // Only block if an ACTIVE or REQUESTED card of this type already exists
        boolean hasActiveOrPending = cardRepo.findByUserId(userId).stream()
            .filter(c -> c.getCardType() == cardType)
            .anyMatch(c -> c.getStatus() == Card.CardStatus.ACTIVE || c.getStatus() == Card.CardStatus.REQUESTED);
        if (hasActiveOrPending)
            throw new BankingException("You already have an active or pending " + req.cardType + " card", 409);

        User u = userRepo.findById(userId).orElseThrow();
        // Generate unique placeholder: REQ + userId + timestamp last 9 digits = 16 chars max
        String placeholder;
        do {
            placeholder = "REQ" + userId + (System.currentTimeMillis() % 1000000000L);
            if (placeholder.length() > 20) placeholder = placeholder.substring(0, 20);
        } while (cardRepo.existsByCardNumber(placeholder));

        Card card = Card.builder()
            .cardNumber(placeholder)
            .user(u).account(acc)
            .cardType(cardType)
            .cardNetwork(req.cardNetwork != null ? Card.CardNetwork.valueOf(req.cardNetwork) : Card.CardNetwork.RUPAY)
            .cardHolderName((u.getFirstName() + " " + u.getLastName()).toUpperCase())
            .expiryMonth(LocalDate.now().getMonthValue())
            .expiryYear(LocalDate.now().getYear() + 4)
            .cvvHash(passwordEncoder.encode(String.valueOf((int)(Math.random()*900)+100)))
            .creditLimit(cardType == Card.CardType.CREDIT ? BigDecimal.valueOf(50000) : null)
            .status(Card.CardStatus.REQUESTED)
            .requestedAt(LocalDateTime.now())
            .build();

        card = cardRepo.save(card);
        return mapToResponse(card);
    }

    public List<CardResponse> getUserCards(Long userId) {
        return cardRepo.findByUserId(userId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<CardResponse> getPendingCardRequests() {
        return cardRepo.findByStatus(Card.CardStatus.REQUESTED).stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public void issueCard(Long cardId) {
        Card card = cardRepo.findById(cardId)
            .orElseThrow(() -> new BankingException("Card not found", 404));
        if (card.getStatus() != Card.CardStatus.REQUESTED) {
            throw new BankingException("Card is already " + card.getStatus(), 400);
        }
        String actualCardNo = "4" + (100000000000000L + (long)(Math.random() * 900000000000000L));
        card.setCardNumber(actualCardNo);
        card.setStatus(Card.CardStatus.ACTIVE);
        card.setActivatedAt(LocalDateTime.now());
        cardRepo.save(card);
    }

    @Transactional
    public void rejectCard(Long cardId) {
        Card card = cardRepo.findById(cardId)
            .orElseThrow(() -> new BankingException("Card not found", 404));
        if (card.getStatus() != Card.CardStatus.REQUESTED) {
            throw new BankingException("Card is already " + card.getStatus(), 400);
        }
        card.setStatus(Card.CardStatus.CANCELLED);
        cardRepo.save(card);
    }

    @Transactional
    public void blockCard(Long userId, Long cardId, String reason) {
        Card card = getAndValidate(userId, cardId);
        if (card.getStatus() == Card.CardStatus.BLOCKED) throw new BankingException("Card already blocked", 400);
        card.setStatus(Card.CardStatus.BLOCKED);
        card.setBlockedAt(LocalDateTime.now());
        card.setBlockReason(reason);
        cardRepo.save(card);
    }

    @Transactional
    public void unblockCard(Long userId, Long cardId) {
        Card card = getAndValidate(userId, cardId);
        if (card.getStatus() != Card.CardStatus.BLOCKED) throw new BankingException("Card is not blocked", 400);
        card.setStatus(Card.CardStatus.ACTIVE);
        card.setBlockedAt(null);
        card.setBlockReason(null);
        cardRepo.save(card);
    }

    @Transactional
    public void setPin(Long userId, SetPinRequest req) {
        Card card = getAndValidate(userId, req.cardId);
        card.setPinHash(passwordEncoder.encode(req.pin));
        if (card.getStatus() == Card.CardStatus.REQUESTED) {
            card.setStatus(Card.CardStatus.ACTIVE);
            card.setActivatedAt(LocalDateTime.now());
        }
        cardRepo.save(card);
    }

    @Transactional
    public CardResponse updateSettings(Long userId, Long cardId, Map<String, Boolean> settings) {
        Card card = getAndValidate(userId, cardId);
        if (settings.containsKey("isOnlineEnabled"))         card.setIsOnlineEnabled(settings.get("isOnlineEnabled"));
        if (settings.containsKey("isInternationalEnabled"))  card.setIsInternationalEnabled(settings.get("isInternationalEnabled"));
        if (settings.containsKey("isContactlessEnabled"))    card.setIsContactlessEnabled(settings.get("isContactlessEnabled"));
        return mapToResponse(cardRepo.save(card));
    }

    public Map<String, Object> getAnalytics(Long userId, Long cardId) {
        Card card = getAndValidate(userId, cardId);
        long totalTxns = txnRepo.countByCardId(cardId);
        return Map.of(
            "cardId", cardId,
            "cardNumber", card.getCardNumber(),
            "totalTransactions", totalTxns,
            "status", card.getStatus().name()
        );
    }

    private Card getAndValidate(Long userId, Long cardId) {
        Card card = cardRepo.findById(cardId).orElseThrow(() -> new BankingException("Card not found", 404));
        if (!card.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        return card;
    }

    private CardResponse mapToResponse(Card c) {
        return CardResponse.builder()
            .id(c.getId()).cardNumber(c.getCardNumber()).cardType(c.getCardType().name())
            .cardNetwork(c.getCardNetwork().name()).cardHolderName(c.getCardHolderName())
            .expiryMonth(c.getExpiryMonth()).expiryYear(c.getExpiryYear())
            .creditLimit(c.getCreditLimit()).outstandingBalance(c.getOutstandingBalance())
            .status(c.getStatus().name()).isOnlineEnabled(c.getIsOnlineEnabled())
            .isInternationalEnabled(c.getIsInternationalEnabled())
            .isContactlessEnabled(c.getIsContactlessEnabled()).activatedAt(c.getActivatedAt())
            .requestedAt(c.getRequestedAt())
            .build();
    }
}
