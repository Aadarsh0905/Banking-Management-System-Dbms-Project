package com.banking.controller;

import com.banking.dto.ApiResponse;
import com.banking.dto.StripeDTOs.*;
import com.banking.dto.TransactionResponse;
import com.banking.security.BankUserDetails;
import com.banking.service.StripeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments/stripe")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "Stripe Payment Gateway integration")
public class PaymentController {

    private final StripeService stripeService;

    @GetMapping("/config")
    @Operation(summary = "Get Stripe public configuration")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getConfig() {
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of(
                "publishableKey", stripeService.getEffectivePublishableKey(),
                "configured", stripeService.getEffectiveSecretKey() != null && stripeService.getEffectiveSecretKey().startsWith("sk_")
        )));
    }

    @PostMapping("/checkout")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create Stripe Checkout session for bank deposit")
    public ResponseEntity<ApiResponse<StripeCheckoutResponse>> createCheckout(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody StripeCheckoutRequest req,
            jakarta.servlet.http.HttpServletRequest request) {
        if (req.getReturnUrl() == null || req.getReturnUrl().isBlank()) {
            String origin = request.getHeader("Origin");
            if (origin != null && !origin.isBlank()) {
                req.setReturnUrl(origin);
            } else {
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.isBlank()) {
                    try {
                        java.net.URI uri = java.net.URI.create(referer);
                        req.setReturnUrl(uri.getScheme() + "://" + uri.getAuthority());
                    } catch (Exception ignored) {}
                }
            }
        }
        return ResponseEntity.ok(ApiResponse.success(stripeService.createCheckoutSession(ud.getId(), req)));
    }

    @PostMapping("/verify")
    @Operation(summary = "Verify Stripe Checkout Session and credit funds")
    public ResponseEntity<ApiResponse<TransactionResponse>> verifySession(
            @Valid @RequestBody StripeVerifyRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Deposit processed successfully", 
                stripeService.verifyAndCredit(req.getSessionId(), req.getAccountId(), req.getAmount())));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Stripe Webhook handler for async events")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {
        stripeService.handleWebhook(payload, sigHeader);
        return ResponseEntity.ok("Received");
    }
}
