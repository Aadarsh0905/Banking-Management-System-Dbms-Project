package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

public class StripeDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StripeCheckoutRequest {
        @NotNull(message = "Account ID is required")
        private Long accountId;

        @NotNull(message = "Deposit amount is required")
        @DecimalMin(value = "1.00", message = "Minimum deposit amount is 1.00")
        private BigDecimal amount;

        private String currency; // default: "inr" or "usd"
        private String returnUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StripeCheckoutResponse {
        private String sessionId;
        private String checkoutUrl;
        private boolean mock;
        private String publishableKey;
        private BigDecimal amount;
        private String currency;
        private String accountNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeVerifyRequest {
        @NotNull(message = "Session ID is required")
        private String sessionId;

        private Long accountId;
        private BigDecimal amount;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DirectDepositRequest {
        @NotNull(message = "Account ID is required")
        private Long accountId;

        @NotNull(message = "Deposit amount is required")
        @DecimalMin(value = "1.00", message = "Minimum deposit amount is 1.00")
        private BigDecimal amount;

        private String method; // PHONEPE, GOOGLE_PAY, PAYTM, UPI_QR, NETBANKING
        private String reference; // VPA, Bank name, or user reference
    }
}
