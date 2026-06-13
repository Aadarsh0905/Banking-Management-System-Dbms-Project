package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ── Generic API Response ───────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private int status;
    private LocalDateTime timestamp = LocalDateTime.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder().success(true).data(data).status(200).build();
    }
    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder().success(true).message(message).data(data).status(200).build();
    }
    public static <T> ApiResponse<T> error(String message, int status) {
        return ApiResponse.<T>builder().success(false).message(message).status(status).build();
    }
}

// ── Auth DTOs ──────────────────────────────────────────────
public class AuthDTOs {
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Size(min=4,max=50)     public String username;
        @NotBlank @Email                   public String email;
        @NotBlank @Size(min=8,max=100)
        @Pattern(regexp="^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
                 message="Password must have upper, lower, digit and special character")
        public String password;
        @NotBlank @Size(min=2,max=50)     public String firstName;
        @NotBlank @Size(min=2,max=50)     public String lastName;
        @NotBlank @Pattern(regexp="^[6-9]\\d{9}$", message="Invalid Indian mobile number")
        public String phone;
        public LocalDate dateOfBirth;
        public String gender;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank public String usernameOrEmail;
        @NotBlank public String password;
    }

    @Data @Builder
    public static class AuthResponse {
        public String accessToken;
        public String refreshToken;
        public String tokenType = "Bearer";
        public Long expiresIn;
        public UserResponse user;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank @Email public String email;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank public String token;
        @NotBlank @Size(min=8) public String newPassword;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RefreshTokenRequest {
        @NotBlank public String refreshToken;
    }
}

// ── User DTOs ──────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    public Long id;
    public String username;
    public String email;
    public String firstName;
    public String lastName;
    public String phone;
    public String dateOfBirth;
    public String gender;
    public String profilePictureUrl;
    public Boolean isActive;
    public Boolean isLocked;
    public Boolean emailVerified;
    public List<String> roles;
    public String kycStatus;
    public LocalDateTime lastLoginAt;
    public LocalDateTime createdAt;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    @Size(max=50) public String firstName;
    @Size(max=50) public String lastName;
    @Pattern(regexp="^[6-9]\\d{9}$") public String phone;
    public String gender;
}

// ── KYC DTOs ──────────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
public class KycRequest {
    @NotBlank @Pattern(regexp="\\d{12}", message="Aadhaar must be 12 digits")
    public String aadhaarNumber;
    @NotBlank @Pattern(regexp="[A-Z]{5}[0-9]{4}[A-Z]", message="Invalid PAN format")
    public String panNumber;
    @NotBlank public String addressLine1;
    public String addressLine2;
    @NotBlank public String city;
    @NotBlank public String state;
    @NotBlank @Pattern(regexp="\\d{6}") public String pincode;
}

// ── Account DTOs ───────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccountResponse {
    public Long id;
    public String accountNumber;
    public String accountType;
    public BigDecimal balance;
    public BigDecimal availableBalance;
    public String currency;
    public String status;
    public String branchName;
    public String ifscCode;
    public LocalDate openedAt;
    public LocalDateTime lastTransactionAt;
    public String nomineeName;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class OpenAccountRequest {
    @NotNull public Long accountTypeId;
    @NotNull public Long branchId;
    public String nomineeName;
    public String nomineeRelation;
}

// ── Transaction DTOs ───────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {
    public Long id;
    public String transactionRef;
    public String transactionType;
    public BigDecimal amount;
    public String currency;
    public String status;
    public String channel;
    public String description;
    public String fromAccount;
    public String toAccount;
    public BigDecimal balanceBefore;
    public BigDecimal balanceAfter;
    public LocalDateTime initiatedAt;
    public LocalDateTime completedAt;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class DepositRequest {
    @NotNull public Long accountId;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
    public String channel;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class WithdrawalRequest {
    @NotNull public Long accountId;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
    public String channel;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class FundTransferRequest {
    @NotNull public Long fromAccountId;
    @NotBlank public String toAccountNumber;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
    public String ifscCode;
}

// ── Loan DTOs ──────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoanApplicationResponse {
    public Long id;
    public String applicationNo;
    public String loanType;
    public BigDecimal amountRequested;
    public Integer tenureMonths;
    public String status;
    public BigDecimal emiEstimate;
    public String purpose;
    public LocalDateTime submittedAt;
    public LocalDateTime createdAt;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class LoanApplicationRequest {
    @NotNull public Long loanTypeId;
    @NotNull public Long accountId;
    @NotNull @DecimalMin("1000") public BigDecimal amountRequested;
    @NotNull @Min(3) public Integer tenureMonths;
    public String purpose;
    @NotNull @DecimalMin("10000") public BigDecimal annualIncome;
    @NotBlank public String employmentType;
    public String employerName;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoanCalculatorResponse {
    public BigDecimal principal;
    public BigDecimal interestRate;
    public Integer tenureMonths;
    public BigDecimal emi;
    public BigDecimal totalAmount;
    public BigDecimal totalInterest;
    public BigDecimal processingFee;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoanResponse {
    public Long id;
    public String loanAccountNumber;
    public String loanType;
    public BigDecimal principalAmount;
    public BigDecimal interestRate;
    public Integer tenureMonths;
    public BigDecimal emiAmount;
    public BigDecimal outstandingBalance;
    public LocalDate disbursedAt;
    public LocalDate lastEmiDate;
    public String status;
    public Integer totalEmis;
    public Integer paidEmis;
    public Integer overdueEmis;
}

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmiScheduleResponse {
    public Integer emiNumber;
    public LocalDate dueDate;
    public BigDecimal emiAmount;
    public BigDecimal principalComponent;
    public BigDecimal interestComponent;
    public BigDecimal outstandingAfter;
    public BigDecimal paidAmount;
    public String status;
    public LocalDateTime paidAt;
}

// ── Card DTOs ──────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CardResponse {
    public Long id;
    public String cardNumber;
    public String cardType;
    public String cardNetwork;
    public String cardHolderName;
    public Integer expiryMonth;
    public Integer expiryYear;
    public BigDecimal creditLimit;
    public BigDecimal outstandingBalance;
    public String status;
    public Boolean isOnlineEnabled;
    public Boolean isInternationalEnabled;
    public Boolean isContactlessEnabled;
    public LocalDateTime activatedAt;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class CardRequest {
    @NotNull public Long accountId;
    @NotBlank public String cardType;
    public String cardNetwork;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class BlockCardRequest {
    @NotNull public Long cardId;
    @NotBlank public String reason;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class SetPinRequest {
    @NotNull public Long cardId;
    @NotBlank @Pattern(regexp="\\d{4}", message="PIN must be 4 digits") public String pin;
    @NotBlank public String cvv;
}

// ── UPI DTOs ──────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpiResponse {
    public Long id;
    public String upiId;
    public String qrCodeUrl;
    public Boolean isDefault;
    public Boolean isActive;
    public String linkedAccountNumber;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateUpiRequest {
    @NotNull public Long accountId;
    @NotBlank @Pattern(regexp="[a-zA-Z0-9.\\-_]+@[a-zA-Z]+", message="Invalid UPI ID format")
    public String upiId;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class UpiTransferRequest {
    @NotBlank public String fromUpiId;
    @NotBlank public String toUpiId;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
}

// ── Beneficiary DTOs ──────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BeneficiaryResponse {
    public Long id;
    public String nickname;
    public String accountNumber;
    public String ifscCode;
    public String bankName;
    public String beneficiaryName;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class AddBeneficiaryRequest {
    @NotBlank @Size(max=50) public String nickname;
    @NotBlank @Size(min=10,max=20) public String accountNumber;
    @NotBlank @Size(min=11,max=15) public String ifscCode;
    public String bankName;
    @NotBlank @Size(max=100) public String beneficiaryName;
}

// ── Admin DTOs ─────────────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardStats {
    public Long totalCustomers;
    public Long totalAccounts;
    public Long totalTransactionsToday;
    public BigDecimal totalTransactionValueToday;
    public Long pendingLoanApplications;
    public Long pendingKycVerifications;
    public Long activeLoans;
    public Long totalBranches;
}

@Data @NoArgsConstructor @AllArgsConstructor
public class LoanReviewRequest {
    @NotNull public Long applicationId;
    @NotBlank public String decision;   // APPROVED or REJECTED
    public String remarks;
}

// ── Notification DTOs ─────────────────────────────────────
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    public Long id;
    public String title;
    public String message;
    public String channel;
    public String status;
    public LocalDateTime createdAt;
    public LocalDateTime readAt;
}

// ── Statement DTOs ────────────────────────────────────────
@Data @NoArgsConstructor @AllArgsConstructor
public class StatementRequest {
    @NotNull public Long accountId;
    @NotNull public LocalDate fromDate;
    @NotNull public LocalDate toDate;
}
