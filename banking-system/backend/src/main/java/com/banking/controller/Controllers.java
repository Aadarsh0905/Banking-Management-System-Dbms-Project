package com.banking.controller;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.BankingException;
import com.banking.repository.*;
import com.banking.security.BankUserDetails;
import com.banking.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ============================================================
// Auth Controller
// ============================================================
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Registration, login, password management")
class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new customer")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody AuthDTOs.RegisterRequest req) {
        return ResponseEntity.status(201)
            .body(ApiResponse.success("Registration successful", authService.register(req)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive JWT tokens")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> login(@Valid @RequestBody AuthDTOs.LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.login(req)));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody AuthDTOs.ForgotPasswordRequest req) {
        authService.forgotPassword(req.email);
        return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody AuthDTOs.ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthDTOs.AuthResponse>> refresh(@Valid @RequestBody AuthDTOs.RefreshTokenRequest req) {
        return ResponseEntity.ok(ApiResponse.success(authService.refreshToken(req.refreshToken)));
    }
}

// ============================================================
// User Controller
// ============================================================
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "User", description = "Profile and KYC management")
class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<ApiResponse<UserResponse>> getProfile(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(ud.getId())));
    }

    @PutMapping("/me")
    @Operation(summary = "Update profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", userService.updateProfile(ud.getId(), req)));
    }

    @PostMapping("/me/avatar")
    @Operation(summary = "Upload profile picture")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.success("Avatar uploaded", userService.uploadAvatar(ud.getId(), file)));
    }

    @PostMapping("/kyc")
    @Operation(summary = "Submit KYC details")
    public ResponseEntity<ApiResponse<Void>> submitKyc(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody KycRequest req) {
        userService.submitKyc(ud.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("KYC submitted for review", null));
    }

    @GetMapping("/kyc")
    @Operation(summary = "Get KYC status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getKycStatus(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getKycStatus(ud.getId())));
    }

    @GetMapping("/beneficiaries")
    @Operation(summary = "Get beneficiaries")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(userService.getBeneficiaries(ud.getId())));
    }

    @PostMapping("/beneficiaries")
    @Operation(summary = "Add beneficiary")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody AddBeneficiaryRequest req) {
        return ResponseEntity.status(201).body(ApiResponse.success("Beneficiary added", userService.addBeneficiary(ud.getId(), req)));
    }

    @DeleteMapping("/beneficiaries/{id}")
    @Operation(summary = "Remove beneficiary")
    public ResponseEntity<ApiResponse<Void>> removeBeneficiary(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable Long id) {
        userService.removeBeneficiary(ud.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary removed", null));
    }
}

// ============================================================
// Account Controller
// ============================================================
@RestController
@RequestMapping("/accounts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Account", description = "Account management")
class AccountController {
    private final AccountService accountService;
    private final AccountTypeRepository accountTypeRepo;
    private final BranchRepository branchRepo;
    private final StatementService statementService;

    @GetMapping
    @Operation(summary = "Get all accounts for current user")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getAccounts(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getUserAccounts(ud.getId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account by ID")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccount(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(accountService.getAccountById(id, ud.getId())));
    }

    @PostMapping("/open")
    @Operation(summary = "Open a new account")
    public ResponseEntity<ApiResponse<AccountResponse>> openAccount(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody OpenAccountRequest req) {
        return ResponseEntity.status(201)
            .body(ApiResponse.success("Account opened successfully", accountService.openAccount(ud.getId(), req)));
    }

    @PatchMapping("/{id}/close")
    @Operation(summary = "Close account")
    public ResponseEntity<ApiResponse<Void>> closeAccount(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long id) {
        accountService.closeAccount(id, ud.getId());
        return ResponseEntity.ok(ApiResponse.success("Account closed", null));
    }

    @GetMapping("/types")
    @Operation(summary = "Get available account types")
    public ResponseEntity<ApiResponse<List<AccountType>>> getAccountTypes() {
        return ResponseEntity.ok(ApiResponse.success(accountTypeRepo.findByIsActiveTrue()));
    }

    @GetMapping("/branches")
    @Operation(summary = "Get all branches")
    public ResponseEntity<ApiResponse<List<Branch>>> getBranches() {
        return ResponseEntity.ok(ApiResponse.success(branchRepo.findByIsActiveTrue()));
    }

    @PostMapping("/statement")
    @Operation(summary = "Download account statement as PDF")
    public ResponseEntity<byte[]> downloadStatement(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody StatementRequest req) {
        byte[] pdf = statementService.generateStatementPdf(ud.getId(), req);
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=statement.pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }
}

// ============================================================
// Transaction Controller
// ============================================================
@RestController
@RequestMapping("/transactions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Transaction", description = "Deposits, withdrawals, transfers")
class TransactionController {
    private final TransactionService txnService;

    @PostMapping("/deposit")
    @Operation(summary = "Deposit money")
    public ResponseEntity<ApiResponse<TransactionResponse>> deposit(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody DepositRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", txnService.deposit(req, ud.getId())));
    }

    @PostMapping("/withdraw")
    @Operation(summary = "Withdraw money")
    public ResponseEntity<ApiResponse<TransactionResponse>> withdraw(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody WithdrawalRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Withdrawal successful", txnService.withdraw(req, ud.getId())));
    }

    @PostMapping("/transfer")
    @Operation(summary = "Fund transfer")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody FundTransferRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Transfer successful", txnService.transfer(req, ud.getId())));
    }

    @GetMapping
    @Operation(summary = "Get transaction history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(txnService.getTransactions(ud.getId(), page, size)));
    }

    @GetMapping("/{ref}")
    @Operation(summary = "Get transaction by reference")
    public ResponseEntity<ApiResponse<TransactionResponse>> getByRef(@PathVariable String ref) {
        return ResponseEntity.ok(ApiResponse.success(txnService.getByRef(ref)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search transactions with filters")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> search(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(txnService.searchTransactions(ud.getId(), type, status, from, to, page, size)));
    }

    @GetMapping("/{ref}/receipt")
    @Operation(summary = "Download transaction receipt PDF")
    public ResponseEntity<byte[]> downloadReceipt(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable String ref) {
        byte[] pdf = txnService.generateReceipt(ref, ud.getId());
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=receipt-" + ref + ".pdf")
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
    }

    @PostMapping("/schedule")
    @Operation(summary = "Create scheduled transfer")
    public ResponseEntity<ApiResponse<Map<String,Object>>> scheduleTransfer(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestBody Map<String, Object> req) {
        return ResponseEntity.status(201).body(ApiResponse.success("Transfer scheduled", txnService.scheduleTransfer(req, ud.getId())));
    }

    @GetMapping("/scheduled")
    @Operation(summary = "Get scheduled transfers")
    public ResponseEntity<ApiResponse<List<Map<String,Object>>>> getScheduled(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(txnService.getScheduledTransfers(ud.getId())));
    }
}

// ============================================================
// Loan Controller
// ============================================================
@RestController
@RequestMapping("/loans")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Loan", description = "Loan applications, tracking, EMI")
class LoanController {
    private final LoanService loanService;
    private final LoanTypeRepository loanTypeRepo;

    @GetMapping("/types")
    @Operation(summary = "Get all loan types")
    public ResponseEntity<ApiResponse<List<LoanType>>> getLoanTypes() {
        return ResponseEntity.ok(ApiResponse.success(loanTypeRepo.findByIsActiveTrue()));
    }

    @GetMapping("/calculate")
    @Operation(summary = "EMI calculator")
    public ResponseEntity<ApiResponse<LoanCalculatorResponse>> calculate(
            @RequestParam Long loanTypeId,
            @RequestParam BigDecimal amount,
            @RequestParam int tenureMonths) {
        return ResponseEntity.ok(ApiResponse.success(loanService.calculate(loanTypeId, amount, tenureMonths)));
    }

    @PostMapping("/apply")
    @Operation(summary = "Apply for a loan")
    public ResponseEntity<ApiResponse<LoanApplicationResponse>> apply(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody LoanApplicationRequest req) {
        return ResponseEntity.status(201)
            .body(ApiResponse.success("Loan application submitted", loanService.applyForLoan(ud.getId(), req)));
    }

    @GetMapping("/applications")
    @Operation(summary = "Get my loan applications")
    public ResponseEntity<ApiResponse<List<LoanApplicationResponse>>> getApplications(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getUserApplications(ud.getId())));
    }

    @GetMapping
    @Operation(summary = "Get my active loans")
    public ResponseEntity<ApiResponse<List<LoanResponse>>> getLoans(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getUserLoans(ud.getId())));
    }

    @GetMapping("/{loanId}/emi-schedule")
    @Operation(summary = "Get EMI schedule")
    public ResponseEntity<ApiResponse<List<EmiScheduleResponse>>> getEmiSchedule(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long loanId) {
        return ResponseEntity.ok(ApiResponse.success(loanService.getEmiSchedule(loanId, ud.getId())));
    }

    @PostMapping("/{loanId}/pay-emi")
    @Operation(summary = "Pay EMI")
    public ResponseEntity<ApiResponse<TransactionResponse>> payEmi(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable Long loanId,
            @RequestParam Long accountId) {
        return ResponseEntity.ok(ApiResponse.success("EMI paid", loanService.payEmi(loanId, accountId, ud.getId())));
    }
}

// ============================================================
// Card Controller
// ============================================================
@RestController
@RequestMapping("/cards")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Card", description = "Debit/Credit card management")
class CardController {
    private final CardService cardService;

    @GetMapping
    @Operation(summary = "Get my cards")
    public ResponseEntity<ApiResponse<List<CardResponse>>> getCards(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getUserCards(ud.getId())));
    }

    @PostMapping("/request")
    @Operation(summary = "Request a new card")
    public ResponseEntity<ApiResponse<CardResponse>> requestCard(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody CardRequest req) {
        return ResponseEntity.status(201)
            .body(ApiResponse.success("Card request submitted", cardService.requestCard(ud.getId(), req)));
    }

    @PatchMapping("/{id}/block")
    @Operation(summary = "Block card")
    public ResponseEntity<ApiResponse<Void>> blockCard(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable Long id,
            @RequestBody BlockCardRequest req) {
        cardService.blockCard(ud.getId(), id, req.reason);
        return ResponseEntity.ok(ApiResponse.success("Card blocked", null));
    }

    @PatchMapping("/{id}/unblock")
    @Operation(summary = "Unblock card")
    public ResponseEntity<ApiResponse<Void>> unblockCard(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long id) {
        cardService.unblockCard(ud.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Card unblocked", null));
    }

    @PostMapping("/set-pin")
    @Operation(summary = "Set or change card PIN")
    public ResponseEntity<ApiResponse<Void>> setPin(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody SetPinRequest req) {
        cardService.setPin(ud.getId(), req);
        return ResponseEntity.ok(ApiResponse.success("PIN set successfully", null));
    }

    @GetMapping("/{id}/analytics")
    @Operation(summary = "Card usage analytics")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getAnalytics(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(cardService.getAnalytics(ud.getId(), id)));
    }

    @PatchMapping("/{id}/settings")
    @Operation(summary = "Update card settings (online/international/contactless)")
    public ResponseEntity<ApiResponse<CardResponse>> updateSettings(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> settings) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", cardService.updateSettings(ud.getId(), id, settings)));
    }
}

// ============================================================
// UPI Controller
// ============================================================
@RestController
@RequestMapping("/upi")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "UPI", description = "UPI ID management and payments")
class UpiController {
    private final UpiService upiService;

    @GetMapping
    @Operation(summary = "Get my UPI IDs")
    public ResponseEntity<ApiResponse<List<UpiResponse>>> getUpiIds(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(upiService.getUserUpiIds(ud.getId())));
    }

    @PostMapping
    @Operation(summary = "Create UPI ID")
    public ResponseEntity<ApiResponse<UpiResponse>> createUpi(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody CreateUpiRequest req) {
        return ResponseEntity.status(201)
            .body(ApiResponse.success("UPI ID created", upiService.createUpiId(ud.getId(), req)));
    }

    @GetMapping("/{upiId}/qr")
    @Operation(summary = "Generate QR code for UPI ID")
    public ResponseEntity<byte[]> getQrCode(
            @AuthenticationPrincipal BankUserDetails ud,
            @PathVariable String upiId) {
        byte[] qr = upiService.generateQrCode(upiId, ud.getId());
        return ResponseEntity.ok().contentType(MediaType.IMAGE_PNG).body(qr);
    }

    @PostMapping("/send")
    @Operation(summary = "Send money via UPI")
    public ResponseEntity<ApiResponse<TransactionResponse>> sendMoney(
            @AuthenticationPrincipal BankUserDetails ud,
            @Valid @RequestBody UpiTransferRequest req) {
        return ResponseEntity.ok(ApiResponse.success("UPI payment successful", upiService.sendMoney(ud.getId(), req)));
    }

    @PostMapping("/request")
    @Operation(summary = "Request money via UPI")
    public ResponseEntity<ApiResponse<Map<String,Object>>> requestMoney(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(ApiResponse.success("Payment request sent", upiService.requestMoney(ud.getId(), req)));
    }

    @GetMapping("/history")
    @Operation(summary = "UPI transaction history")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getHistory(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(upiService.getUpiHistory(ud.getId(), page, size)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete UPI ID")
    public ResponseEntity<ApiResponse<Void>> deleteUpi(
            @AuthenticationPrincipal BankUserDetails ud, @PathVariable Long id) {
        upiService.deleteUpiId(ud.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("UPI ID deleted", null));
    }
}

// ============================================================
// Notification Controller
// ============================================================
@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notifications")
class NotificationController {
    private final NotificationService notifService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAll(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(notifService.getNotifications(ud.getId(), page, size)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@AuthenticationPrincipal BankUserDetails ud) {
        return ResponseEntity.ok(ApiResponse.success(notifService.getUnreadCount(ud.getId())));
    }

    @PatchMapping("/mark-all-read")
    public ResponseEntity<ApiResponse<Void>> markAllRead(@AuthenticationPrincipal BankUserDetails ud) {
        notifService.markAllRead(ud.getId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}

// ============================================================
// Admin Controller
// ============================================================
@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin operations")
class AdminController {
    private final AdminService adminService;

    @GetMapping("/dashboard")
    @Operation(summary = "Admin dashboard stats")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/customers")
    @Operation(summary = "List all customers")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCustomers(page, size, search)));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getCustomerById(id)));
    }

    @PatchMapping("/customers/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateCustomer(@PathVariable Long id) {
        adminService.setCustomerActive(id, true);
        return ResponseEntity.ok(ApiResponse.success("Customer activated", null));
    }

    @PatchMapping("/customers/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateCustomer(@PathVariable Long id) {
        adminService.setCustomerActive(id, false);
        return ResponseEntity.ok(ApiResponse.success("Customer deactivated", null));
    }

    @PatchMapping("/customers/{id}/unlock")
    public ResponseEntity<ApiResponse<Void>> unlockCustomer(@PathVariable Long id) {
        adminService.unlockCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer unlocked", null));
    }

    @GetMapping("/kyc/pending")
    @Operation(summary = "Pending KYC verifications")
    public ResponseEntity<ApiResponse<Page<Map<String,Object>>>> getPendingKyc(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingKyc(page, size)));
    }

    @PatchMapping("/kyc/{kycId}/verify")
    public ResponseEntity<ApiResponse<Void>> verifyKyc(
            @PathVariable Long kycId,
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestBody Map<String,String> body) {
        adminService.verifyKyc(kycId, ud.getId(), body.get("status"), body.get("remarks"));
        return ResponseEntity.ok(ApiResponse.success("KYC updated", null));
    }

    @GetMapping("/loans/pending")
    @Operation(summary = "Pending loan applications")
    public ResponseEntity<ApiResponse<Page<LoanApplicationResponse>>> getPendingLoans(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getPendingLoans(page, size)));
    }

    @PostMapping("/loans/review")
    @Operation(summary = "Approve or reject loan")
    public ResponseEntity<ApiResponse<Void>> reviewLoan(
            @AuthenticationPrincipal BankUserDetails ud,
            @RequestBody LoanReviewRequest req) {
        adminService.reviewLoan(req, ud.getId());
        return ResponseEntity.ok(ApiResponse.success("Loan reviewed", null));
    }

    @GetMapping("/transactions")
    @Operation(summary = "Monitor all transactions")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getAllTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllTransactions(page, size)));
    }

    @GetMapping("/reports/summary")
    @Operation(summary = "Generate summary report")
    public ResponseEntity<ApiResponse<Map<String,Object>>> getSummaryReport(
            @RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSummaryReport(from, to)));
    }

    @GetMapping("/accounts")
    @Operation(summary = "List all accounts")
    public ResponseEntity<ApiResponse<Page<AccountResponse>>> getAllAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllAccounts(page, size)));
    }

    @PatchMapping("/accounts/{id}/freeze")
    public ResponseEntity<ApiResponse<Void>> freezeAccount(@PathVariable Long id) {
        adminService.setAccountStatus(id, "FROZEN");
        return ResponseEntity.ok(ApiResponse.success("Account frozen", null));
    }

    @PatchMapping("/accounts/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateAccount(@PathVariable Long id) {
        adminService.setAccountStatus(id, "ACTIVE");
        return ResponseEntity.ok(ApiResponse.success("Account activated", null));
    }

    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<Branch>>> getBranches() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBranches()));
    }

    @PostMapping("/branches")
    public ResponseEntity<ApiResponse<Branch>> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.status(201).body(ApiResponse.success(adminService.createBranch(branch)));
    }

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getEmployees(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getEmployees(page, size)));
    }
}
