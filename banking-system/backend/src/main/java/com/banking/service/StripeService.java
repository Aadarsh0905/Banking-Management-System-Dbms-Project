package com.banking.service;

import com.banking.dto.StripeDTOs.*;
import com.banking.dto.TransactionResponse;
import com.banking.entity.Account;
import com.banking.entity.Transaction;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StripeService {

    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;
    private final TransactionService transactionService;

    @Value("${stripe.api.secret-key:}")
    private String secretKey;

    @Value("${stripe.api.publishable-key:}")
    private String publishableKey;

    @Value("${stripe.webhook.secret:}")
    private String webhookSecret;

    @Value("${banking.frontend.url:https://banking-frontend.onrender.com}")
    private String frontendUrl;

    public StripeCheckoutResponse createCheckoutSession(Long userId, StripeCheckoutRequest req) {
        Account acc = accountRepo.findById(req.getAccountId())
                .orElseThrow(() -> new BankingException("Account not found", 404));

        if (!acc.getUser().getId().equals(userId)) {
            throw new BankingException("Unauthorized access to account", 403);
        }

        if (acc.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BankingException("Account is not active", 400);
        }

        String currency = (req.getCurrency() != null && !req.getCurrency().isBlank()) 
                ? req.getCurrency().toLowerCase() : "inr";

        // Check if real Stripe secret key is configured
        if (secretKey != null && secretKey.trim().startsWith("sk_")) {
            try {
                Stripe.apiKey = secretKey.trim();

                // Amount in smallest currency unit (e.g. cents/paise: multiply by 100)
                long unitAmount = req.getAmount().multiply(new BigDecimal("100")).longValue();

                String cleanFrontendUrl = frontendUrl.replaceAll("/+$", "");
                String successUrl = cleanFrontendUrl + "/accounts?payment_status=success&session_id={CHECKOUT_SESSION_ID}&acc=" 
                        + acc.getAccountNumber() + "&amt=" + req.getAmount();
                String cancelUrl = cleanFrontendUrl + "/accounts?payment_status=cancelled";

                SessionCreateParams params = SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.PAYMENT)
                        .setSuccessUrl(successUrl)
                        .setCancelUrl(cancelUrl)
                        .addLineItem(
                                SessionCreateParams.LineItem.builder()
                                        .setQuantity(1L)
                                        .setPriceData(
                                                SessionCreateParams.LineItem.PriceData.builder()
                                                        .setCurrency(currency)
                                                        .setUnitAmount(unitAmount)
                                                        .setProductData(
                                                                SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                        .setName("BankPortal Deposit: " + acc.getAccountNumber())
                                                                        .setDescription("Instant Digital Deposit to " + acc.getAccountType().getTypeName())
                                                                        .build()
                                                        )
                                                        .build()
                                        )
                                        .build()
                        )
                        .putMetadata("userId", userId.toString())
                        .putMetadata("accountId", acc.getId().toString())
                        .putMetadata("amount", req.getAmount().toString())
                        .putMetadata("currency", currency)
                        .putMetadata("accountNumber", acc.getAccountNumber())
                        .build();

                Session session = Session.create(params);
                log.info("Created Stripe checkout session: id={}, url={}", session.getId(), session.getUrl());

                return StripeCheckoutResponse.builder()
                        .sessionId(session.getId())
                        .checkoutUrl(session.getUrl())
                        .mock(false)
                        .publishableKey(publishableKey)
                        .amount(req.getAmount())
                        .currency(currency.toUpperCase())
                        .accountNumber(acc.getAccountNumber())
                        .build();

            } catch (Exception e) {
                log.error("Stripe Checkout creation failed: {}", e.getMessage(), e);
                throw new BankingException("Stripe error: " + e.getMessage(), 500);
            }
        }

        // Demo / Mock Mode fallback (when keys are not configured yet)
        String mockSessionId = "mock_cs_" + System.currentTimeMillis() + "_" + acc.getId();
        log.info("Stripe keys not configured; running in Mock mode for account: {}", acc.getAccountNumber());

        return StripeCheckoutResponse.builder()
                .sessionId(mockSessionId)
                .checkoutUrl(null)
                .mock(true)
                .publishableKey("pk_test_mock_mode")
                .amount(req.getAmount())
                .currency(currency.toUpperCase())
                .accountNumber(acc.getAccountNumber())
                .build();
    }

    @Transactional
    public TransactionResponse verifyAndCredit(String sessionId, Long fallbackAccountId, BigDecimal fallbackAmount) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new BankingException("Session ID is required", 400);
        }

        // Idempotency check: has this session already been credited?
        Optional<Transaction> existing = txnRepo.findAll().stream()
                .filter(t -> t.getDescription() != null && t.getDescription().contains(sessionId))
                .findFirst();

        if (existing.isPresent()) {
            log.info("Session {} already credited; returning existing transaction {}", sessionId, existing.get().getTransactionRef());
            return transactionService.mapToResponse(existing.get());
        }

        // 1. Mock / Demo session
        if (sessionId.startsWith("mock_cs_")) {
            if (fallbackAccountId == null || fallbackAmount == null) {
                // Try parsing accountId from mock session format: mock_cs_<time>_<accId>
                String[] parts = sessionId.split("_");
                if (parts.length >= 4 && fallbackAccountId == null) {
                    try { fallbackAccountId = Long.parseLong(parts[3]); } catch (Exception ignored) {}
                }
            }
            if (fallbackAccountId == null || fallbackAmount == null) {
                throw new BankingException("Missing account or amount for mock confirmation", 400);
            }
            return transactionService.depositViaStripe(fallbackAccountId, fallbackAmount, sessionId, true);
        }

        // 2. Real Stripe session
        if (secretKey != null && secretKey.trim().startsWith("sk_")) {
            try {
                Stripe.apiKey = secretKey.trim();
                Session session = Session.retrieve(sessionId);

                if (!"paid".equalsIgnoreCase(session.getPaymentStatus())) {
                    throw new BankingException("Payment has not been completed. Status: " + session.getPaymentStatus(), 400);
                }

                Long accountId = Long.parseLong(session.getMetadata().get("accountId"));
                BigDecimal amount = new BigDecimal(session.getMetadata().get("amount"));

                return transactionService.depositViaStripe(accountId, amount, sessionId, false);

            } catch (BankingException be) {
                throw be;
            } catch (Exception e) {
                log.error("Failed to verify Stripe session {}: {}", sessionId, e.getMessage());
                throw new BankingException("Stripe verification failed: " + e.getMessage(), 500);
            }
        }

        throw new BankingException("Stripe secret key not configured", 500);
    }

    @Transactional
    public void handleWebhook(String payload, String sigHeader) {
        Event event;
        try {
            if (webhookSecret != null && !webhookSecret.isBlank() && sigHeader != null) {
                event = Webhook.constructEvent(payload, sigHeader, webhookSecret.trim());
            } else {
                event = Event.GSON.fromJson(payload, Event.class);
            }
        } catch (Exception e) {
            log.error("Invalid Stripe webhook signature/payload: {}", e.getMessage());
            throw new BankingException("Webhook error", 400);
        }

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null && "paid".equalsIgnoreCase(session.getPaymentStatus())) {
                    String sessionId = session.getId();
                    Long accountId = Long.parseLong(session.getMetadata().get("accountId"));
                    BigDecimal amount = new BigDecimal(session.getMetadata().get("amount"));
                    log.info("Processing webhook payment for session: {}, accountId: {}, amount: {}", sessionId, accountId, amount);
                    verifyAndCredit(sessionId, accountId, amount);
                }
            } catch (Exception e) {
                log.error("Error processing checkout.session.completed webhook: {}", e.getMessage(), e);
            }
        }
    }
}
