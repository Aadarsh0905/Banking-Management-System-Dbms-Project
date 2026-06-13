package com.banking.service;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.BankingException;
import com.banking.repository.*;
import com.banking.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

// ============================================================
// Auth Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;    // added in repos
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BankUserDetailsService userDetailsService;
    private final AuthenticationManager authManager;
    private final NotificationService notificationService;

    @Transactional
    public UserResponse register(AuthDTOs.RegisterRequest req) {
        if (userRepo.existsByUsername(req.username))
            throw new BankingException("Username already taken", 409);
        if (userRepo.existsByEmail(req.email))
            throw new BankingException("Email already registered", 409);
        if (userRepo.existsByPhone(req.phone))
            throw new BankingException("Phone already registered", 409);

        Role customerRole = roleRepo.findByName("ROLE_CUSTOMER")
            .orElseThrow(() -> new BankingException("Role not found", 500));

        User user = User.builder()
            .username(req.username)
            .email(req.email)
            .passwordHash(passwordEncoder.encode(req.password))
            .firstName(req.firstName)
            .lastName(req.lastName)
            .phone(req.phone)
            .dateOfBirth(req.dateOfBirth)
            .gender(req.gender != null ? User.Gender.valueOf(req.gender) : null)
            .isActive(true)
            .isLocked(false)
            .emailVerified(false)
            .emailVerifyToken(UUID.randomUUID().toString())
            .roles(Set.of(customerRole))
            .build();

        user = userRepo.save(user);
        notificationService.sendWelcomeEmail(user);
        log.info("New user registered: {}", user.getUsername());
        return mapToUserResponse(user);
    }

    public AuthDTOs.AuthResponse login(AuthDTOs.LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.usernameOrEmail, req.password));
        } catch (BadCredentialsException e) {
            throw new BankingException("Invalid credentials", 401);
        } catch (LockedException e) {
            throw new BankingException("Account locked due to multiple failed attempts", 423);
        } catch (DisabledException e) {
            throw new BankingException("Account is disabled", 403);
        }

        BankUserDetails ud = (BankUserDetails) userDetailsService.loadUserByUsername(req.usernameOrEmail);
        String accessToken  = jwtUtil.generateAccessToken(ud);
        String refreshToken = jwtUtil.generateRefreshToken(ud);

        // Update last login
        ud.user().setLastLoginAt(LocalDateTime.now());
        userRepo.save(ud.user());

        return AuthDTOs.AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .expiresIn(900L)
            .user(mapToUserResponse(ud.user()))
            .build();
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new BankingException("Email not found", 404));
        String token = UUID.randomUUID().toString();
        user.setPasswordResetToken(token);
        user.setPasswordResetExpires(LocalDateTime.now().plusHours(1));
        userRepo.save(user);
        notificationService.sendPasswordResetEmail(user, token);
    }

    @Transactional
    public void resetPassword(AuthDTOs.ResetPasswordRequest req) {
        User user = userRepo.findByPasswordResetToken(req.token)  // needs custom query in repo
            .orElseThrow(() -> new BankingException("Invalid or expired reset token", 400));
        if (user.getPasswordResetExpires().isBefore(LocalDateTime.now()))
            throw new BankingException("Reset token has expired", 400);
        user.setPasswordHash(passwordEncoder.encode(req.newPassword));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpires(null);
        userRepo.save(user);
    }

    public AuthDTOs.AuthResponse refreshToken(String refreshToken) {
        try {
            String username = jwtUtil.extractUsername(refreshToken);
            UserDetails ud  = userDetailsService.loadUserByUsername(username);

            if (!jwtUtil.isValid(refreshToken, ud))
                throw new BankingException("Invalid or expired refresh token", 401);

            String newAccess  = jwtUtil.generateAccessToken(ud);
            String newRefresh = jwtUtil.generateRefreshToken(ud);

            return AuthDTOs.AuthResponse.builder()
                    .accessToken(newAccess)
                    .refreshToken(newRefresh)
                    .expiresIn(900L)
                    .build();
        } catch (BankingException e) {
            throw e;
        } catch (Exception e) {
            throw new BankingException("Token refresh failed", 401);
        }
    }

    public UserResponse mapToUserResponse(User u) {
        return UserResponse.builder()
            .id(u.getId())
            .username(u.getUsername())
            .email(u.getEmail())
            .firstName(u.getFirstName())
            .lastName(u.getLastName())
            .phone(u.getPhone())
            .dateOfBirth(u.getDateOfBirth() != null ? u.getDateOfBirth().toString() : null)
            .gender(u.getGender() != null ? u.getGender().name() : null)
            .profilePictureUrl(u.getProfilePictureUrl())
            .isActive(u.getIsActive())
            .isLocked(u.getIsLocked())
            .emailVerified(u.getEmailVerified())
            .roles(u.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
            .lastLoginAt(u.getLastLoginAt())
            .createdAt(u.getCreatedAt())
            .build();
    }
}

// ============================================================
// Account Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class AccountService {
    private final AccountRepository accountRepo;
    private final AccountTypeRepository accountTypeRepo;
    private final BranchRepository branchRepo;
    private final UserRepository userRepo;

    @Transactional
    public AccountResponse openAccount(Long userId, OpenAccountRequest req) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new BankingException("User not found", 404));
        AccountType type = accountTypeRepo.findById(req.accountTypeId)
            .orElseThrow(() -> new BankingException("Account type not found", 404));
        Branch branch = branchRepo.findById(req.branchId)
            .orElseThrow(() -> new BankingException("Branch not found", 404));

        String accNumber = generateAccountNumber();
        Account account = Account.builder()
            .accountNumber(accNumber)
            .user(user)
            .branch(branch)
            .accountType(type)
            .balance(BigDecimal.ZERO)
            .availableBalance(BigDecimal.ZERO)
            .currency("INR")
            .status(Account.AccountStatus.ACTIVE)
            .openedAt(LocalDate.now())
            .nomineeName(req.nomineeName)
            .nomineeRelation(req.nomineeRelation)
            .build();

        account = accountRepo.save(account);
        log.info("Account {} opened for user {}", accNumber, userId);
        return mapToResponse(account);
    }

    public List<AccountResponse> getUserAccounts(Long userId) {
        return accountRepo.findByUserId(userId).stream()
            .map(this::mapToResponse).collect(Collectors.toList());
    }

    public AccountResponse getAccountById(Long accountId, Long userId) {
        Account a = accountRepo.findById(accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!a.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized access", 403);
        return mapToResponse(a);
    }

    @Transactional
    public void closeAccount(Long accountId, Long userId) {
        Account a = accountRepo.findById(accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!a.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized access", 403);
        if (a.getBalance().compareTo(BigDecimal.ZERO) > 0)
            throw new BankingException("Please withdraw all funds before closing", 400);
        a.setStatus(Account.AccountStatus.CLOSED);
        a.setClosedAt(LocalDate.now());
        accountRepo.save(a);
    }

    private String generateAccountNumber() {
        String num;
        do { num = "ACC" + (1000000000L + (long)(Math.random() * 9000000000L)); }
        while (accountRepo.findByAccountNumber(num).isPresent());
        return num;
    }

    public AccountResponse mapToResponse(Account a) {
        return AccountResponse.builder()
            .id(a.getId())
            .accountNumber(a.getAccountNumber())
            .accountType(a.getAccountType().getTypeName())
            .balance(a.getBalance())
            .availableBalance(a.getAvailableBalance())
            .currency(a.getCurrency())
            .status(a.getStatus().name())
            .branchName(a.getBranch().getBranchName())
            .ifscCode(a.getBranch().getIfscCode())
            .openedAt(a.getOpenedAt())
            .lastTransactionAt(a.getLastTransactionAt())
            .nomineeName(a.getNomineeName())
            .build();
    }
}

// ============================================================
// Transaction Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class TransactionService {
    private final TransactionRepository txnRepo;
    private final AccountRepository accountRepo;
    private final NotificationService notificationService;
    private final ScheduledTransferRepository scheduledRepo;

    @Transactional
    public TransactionResponse deposit(DepositRequest req, Long userId) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (acc.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Account is not active", 400);

        BigDecimal before = acc.getBalance();
        acc.setBalance(before.add(req.amount));
        acc.setAvailableBalance(acc.getAvailableBalance().add(req.amount));
        acc.setLastTransactionAt(LocalDateTime.now());
        accountRepo.save(acc);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .toAccount(acc)
            .transactionType(Transaction.TransactionType.DEPOSIT)
            .amount(req.amount)
            .balanceBefore(before)
            .balanceAfter(acc.getBalance())
            .description(req.description != null ? req.description : "Cash deposit")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(req.channel != null ? Transaction.Channel.valueOf(req.channel) : Transaction.Channel.BRANCH)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(acc.getUser(), txn);
        return mapToResponse(txn);
    }

    @Transactional
    public TransactionResponse withdraw(WithdrawalRequest req, Long userId) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (acc.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Account is not active", 400);
        if (acc.getAvailableBalance().compareTo(req.amount) < 0)
            throw new BankingException("Insufficient balance", 400);

        BigDecimal before = acc.getBalance();
        acc.setBalance(before.subtract(req.amount));
        acc.setAvailableBalance(acc.getAvailableBalance().subtract(req.amount));
        acc.setLastTransactionAt(LocalDateTime.now());
        accountRepo.save(acc);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .fromAccount(acc)
            .transactionType(Transaction.TransactionType.WITHDRAWAL)
            .amount(req.amount)
            .balanceBefore(before)
            .balanceAfter(acc.getBalance())
            .description(req.description != null ? req.description : "Cash withdrawal")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(req.channel != null ? Transaction.Channel.valueOf(req.channel) : Transaction.Channel.ATM)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(acc.getUser(), txn);
        return mapToResponse(txn);
    }

    @Transactional
    public TransactionResponse transfer(FundTransferRequest req, Long userId) {
        Account from = accountRepo.findById(req.fromAccountId)
            .orElseThrow(() -> new BankingException("Source account not found", 404));
        Account to = accountRepo.findByAccountNumber(req.toAccountNumber)
            .orElseThrow(() -> new BankingException("Destination account not found", 404));

        if (!from.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (from.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Source account is not active", 400);
        if (to.getStatus() != Account.AccountStatus.ACTIVE)
            throw new BankingException("Destination account is not active", 400);
        if (from.getAvailableBalance().compareTo(req.amount) < 0)
            throw new BankingException("Insufficient balance", 400);
        if (from.getId().equals(to.getId()))
            throw new BankingException("Cannot transfer to same account", 400);

        BigDecimal fromBefore = from.getBalance();
        from.setBalance(fromBefore.subtract(req.amount));
        from.setAvailableBalance(from.getAvailableBalance().subtract(req.amount));
        from.setLastTransactionAt(LocalDateTime.now());

        BigDecimal toBefore = to.getBalance();
        to.setBalance(toBefore.add(req.amount));
        to.setAvailableBalance(to.getAvailableBalance().add(req.amount));
        to.setLastTransactionAt(LocalDateTime.now());

        accountRepo.save(from);
        accountRepo.save(to);

        Transaction txn = Transaction.builder()
            .transactionRef(generateRef())
            .fromAccount(from)
            .toAccount(to)
            .transactionType(Transaction.TransactionType.TRANSFER)
            .amount(req.amount)
            .balanceBefore(fromBefore)
            .balanceAfter(from.getBalance())
            .description(req.description != null ? req.description : "Fund transfer")
            .status(Transaction.TransactionStatus.SUCCESS)
            .channel(Transaction.Channel.NETBANKING)
            .initiatedAt(LocalDateTime.now())
            .completedAt(LocalDateTime.now())
            .build();

        txn = txnRepo.save(txn);
        notificationService.sendTransactionAlert(from.getUser(), txn);
        notificationService.sendTransactionAlert(to.getUser(), txn);
        return mapToResponse(txn);
    }

    public Page<TransactionResponse> getTransactions(Long userId, int page, int size) {
        return txnRepo.findByUserId(userId, PageRequest.of(page, size, Sort.by("initiatedAt").descending()))
            .map(this::mapToResponse);
    }

    public TransactionResponse getByRef(String ref) {
        return txnRepo.findByTransactionRef(ref)
            .map(this::mapToResponse)
            .orElseThrow(() -> new BankingException("Transaction not found", 404));
    }

    private String generateRef() {
        return "TXN" + System.currentTimeMillis() + (int)(Math.random() * 1000);
    }

    public Page<TransactionResponse> searchTransactions(
            Long userId, String type, String status,
            String from, String to, int page, int size) {

        Transaction.TransactionType txnType = null;
        Transaction.TransactionStatus txnStatus = null;
        LocalDateTime fromDt = null;
        LocalDateTime toDt   = null;

        try { if (type   != null && !type.isBlank())   txnType   = Transaction.TransactionType.valueOf(type); }   catch (IllegalArgumentException ignored) {}
        try { if (status != null && !status.isBlank()) txnStatus = Transaction.TransactionStatus.valueOf(status); } catch (IllegalArgumentException ignored) {}
        try { if (from != null && !from.isBlank()) fromDt = LocalDate.parse(from).atStartOfDay(); }               catch (Exception ignored) {}
        try { if (to   != null && !to.isBlank())   toDt   = LocalDate.parse(to).atTime(23, 59, 59); }             catch (Exception ignored) {}

        return txnRepo.searchTransactions(userId, txnType, txnStatus, fromDt, toDt,
                PageRequest.of(page, size, Sort.by("initiatedAt").descending()))
                .map(this::mapToResponse);
    }

    public byte[] generateReceipt(String ref, Long userId) {
        Transaction t = txnRepo.findByTransactionRef(ref)
                .orElseThrow(() -> new BankingException("Transaction not found", 404));

        // Verify ownership
        boolean isOwner = (t.getFromAccount() != null && t.getFromAccount().getUser().getId().equals(userId))
                       || (t.getToAccount()   != null && t.getToAccount().getUser().getId().equals(userId));
        if (!isOwner) throw new BankingException("Unauthorized", 403);

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(new Rectangle(400, 600));
            PdfWriter.getInstance(doc, baos);
            doc.open();

            Font title  = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD);
            Font header = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            Font normal = new Font(Font.FontFamily.HELVETICA, 10);
            Font small  = new Font(Font.FontFamily.HELVETICA, 8, Font.ITALIC);

            // Header
            Paragraph p = new Paragraph("TRANSACTION RECEIPT", title);
            p.setAlignment(Element.ALIGN_CENTER);
            doc.add(p);
            doc.add(new Paragraph("Banking Management System", small) {{ setAlignment(Element.ALIGN_CENTER); }});
            doc.add(new Paragraph(" "));

            // Status badge
            String statusText = "✓ " + t.getStatus().name();
            Paragraph status = new Paragraph(statusText, new Font(Font.FontFamily.HELVETICA, 12,
                    Font.BOLD, t.getStatus() == Transaction.TransactionStatus.SUCCESS
                    ? new BaseColor(16, 185, 129) : new BaseColor(239, 68, 68)));
            status.setAlignment(Element.ALIGN_CENTER);
            doc.add(status);
            doc.add(new Paragraph(" "));

            // Amount
            Paragraph amount = new Paragraph("₹" + t.getAmount().toPlainString(),
                    new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD));
            amount.setAlignment(Element.ALIGN_CENTER);
            doc.add(amount);
            doc.add(new Paragraph(" "));

            // Details table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss");

            Object[][] rows = {
                {"Reference No",   t.getTransactionRef()},
                {"Type",           t.getTransactionType().name().replace("_", " ")},
                {"Channel",        t.getChannel().name()},
                {"Date & Time",    t.getInitiatedAt() != null ? t.getInitiatedAt().format(fmt) : "—"},
                {"From Account",   t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : "—"},
                {"To Account",     t.getToAccount()   != null ? t.getToAccount().getAccountNumber()   : "—"},
                {"Description",    t.getDescription() != null ? t.getDescription() : "—"},
                {"Balance After",  t.getBalanceAfter() != null ? "₹" + t.getBalanceAfter().toPlainString() : "—"},
            };

            for (Object[] row : rows) {
                PdfPCell keyCell = new PdfPCell(new Phrase((String) row[0], header));
                keyCell.setBorder(Rectangle.NO_BORDER);
                keyCell.setPadding(4);
                keyCell.setBackgroundColor(new BaseColor(249, 250, 251));
                table.addCell(keyCell);

                PdfPCell valCell = new PdfPCell(new Phrase((String) row[1], normal));
                valCell.setBorder(Rectangle.NO_BORDER);
                valCell.setPadding(4);
                table.addCell(valCell);
            }
            doc.add(table);

            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph("This is a system-generated receipt. No signature required.", small);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("Failed to generate receipt: " + e.getMessage(), 500);
        }
    }

    @Transactional
    public Map<String, Object> scheduleTransfer(Map<String, Object> req, Long userId) {
        Long fromId = Long.valueOf(req.get("fromAccountId").toString());
        Long toId   = Long.valueOf(req.get("toAccountId").toString());
        BigDecimal amount = new BigDecimal(req.get("amount").toString());
        String freq = req.getOrDefault("frequency", "ONCE").toString();
        String nextDate = req.get("nextExecutionDate").toString();

        Account from = accountRepo.findById(fromId)
                .orElseThrow(() -> new BankingException("Source account not found", 404));
        Account to = accountRepo.findById(toId)
                .orElseThrow(() -> new BankingException("Destination account not found", 404));

        if (!from.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);

        ScheduledTransfer st = ScheduledTransfer.builder()
                .fromAccount(from)
                .toAccount(to)
                .amount(amount)
                .description(req.getOrDefault("description", "Scheduled transfer").toString())
                .frequency(ScheduledTransfer.Frequency.valueOf(freq))
                .nextExecutionDate(LocalDate.parse(nextDate))
                .endDate(req.get("endDate") != null ? LocalDate.parse(req.get("endDate").toString()) : null)
                .status(ScheduledTransfer.TransferStatus.ACTIVE)
                .build();

        st = scheduledRepo.save(st);
        return Map.of(
            "id", st.getId(),
            "fromAccount", from.getAccountNumber(),
            "toAccount", to.getAccountNumber(),
            "amount", amount,
            "frequency", freq,
            "nextExecutionDate", nextDate,
            "status", "ACTIVE"
        );
    }

    public List<Map<String, Object>> getScheduledTransfers(Long userId) {
        return scheduledRepo.findByFromAccountUserId(userId).stream()
                .map(st -> (Map<String, Object>) Map.of(
                    "id",                  st.getId(),
                    "fromAccount",         st.getFromAccount().getAccountNumber(),
                    "toAccount",           st.getToAccount().getAccountNumber(),
                    "amount",              st.getAmount(),
                    "frequency",           st.getFrequency().name(),
                    "nextExecutionDate",   st.getNextExecutionDate().toString(),
                    "status",              st.getStatus().name(),
                    "description",         st.getDescription() != null ? st.getDescription() : ""
                ))
                .collect(Collectors.toList());
    }

    public TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
            .id(t.getId())
            .transactionRef(t.getTransactionRef())
            .transactionType(t.getTransactionType().name())
            .amount(t.getAmount())
            .currency(t.getCurrency())
            .status(t.getStatus().name())
            .channel(t.getChannel().name())
            .description(t.getDescription())
            .fromAccount(t.getFromAccount() != null ? t.getFromAccount().getAccountNumber() : null)
            .toAccount(t.getToAccount() != null ? t.getToAccount().getAccountNumber() : null)
            .balanceBefore(t.getBalanceBefore())
            .balanceAfter(t.getBalanceAfter())
            .initiatedAt(t.getInitiatedAt())
            .completedAt(t.getCompletedAt())
            .build();
    }
}

// ============================================================
// Loan Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class LoanService {
    private final LoanRepository loanRepo;
    private final LoanApplicationRepository loanAppRepo;
    private final LoanTypeRepository loanTypeRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final EmiScheduleRepository emiRepo;
    private final NotificationService notificationService;
    private final TransactionRepository txnRepo;

    public LoanCalculatorResponse calculate(Long loanTypeId, BigDecimal amount, int tenureMonths) {
        LoanType lt = loanTypeRepo.findById(loanTypeId)
            .orElseThrow(() -> new BankingException("Loan type not found", 404));
        BigDecimal emi = calculateEmi(amount, lt.getInterestRate(), tenureMonths);
        BigDecimal total = emi.multiply(BigDecimal.valueOf(tenureMonths));
        BigDecimal fee   = amount.multiply(lt.getProcessingFeePct()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        return LoanCalculatorResponse.builder()
            .principal(amount)
            .interestRate(lt.getInterestRate())
            .tenureMonths(tenureMonths)
            .emi(emi)
            .totalAmount(total)
            .totalInterest(total.subtract(amount))
            .processingFee(fee)
            .build();
    }

    @Transactional
    public LoanApplicationResponse applyForLoan(Long userId, LoanApplicationRequest req) {
        LoanType lt = loanTypeRepo.findById(req.loanTypeId)
            .orElseThrow(() -> new BankingException("Loan type not found", 404));
        if (req.amountRequested.compareTo(lt.getMinAmount()) < 0 ||
            req.amountRequested.compareTo(lt.getMaxAmount()) > 0)
            throw new BankingException("Loan amount out of range for this type", 400);

        User user = userRepo.findById(userId)
            .orElseThrow(() -> new BankingException("User not found", 404));
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));

        String appNo = "LOAN" + System.currentTimeMillis();
        LoanApplication app = LoanApplication.builder()
            .applicationNo(appNo)
            .user(user)
            .loanType(lt)
            .account(acc)
            .amountRequested(req.amountRequested)
            .tenureMonths(req.tenureMonths)
            .purpose(req.purpose)
            .annualIncome(req.annualIncome)
            .employmentType(LoanApplication.EmploymentType.valueOf(req.employmentType))
            .employerName(req.employerName)
            .status(LoanApplication.LoanApplicationStatus.SUBMITTED)
            .submittedAt(LocalDateTime.now())
            .build();

        app = loanAppRepo.save(app);
        return mapAppToResponse(app, lt.getInterestRate());
    }

    public List<LoanResponse> getUserLoans(Long userId) {
        return loanRepo.findByUserId(userId).stream().map(this::mapLoanToResponse).collect(Collectors.toList());
    }

    public List<EmiScheduleResponse> getEmiSchedule(Long loanId, Long userId) {
        Loan loan = loanRepo.findById(loanId)
            .orElseThrow(() -> new BankingException("Loan not found", 404));
        if (!loan.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        return emiRepo.findByLoanIdOrderByEmiNumber(loanId).stream()
            .map(this::mapEmiToResponse).collect(Collectors.toList());
    }

    // Admin: approve/reject loan
    @Transactional
    public void reviewLoan(LoanReviewRequest req, Long reviewerId) {
        LoanApplication app = loanAppRepo.findById(req.applicationId)
            .orElseThrow(() -> new BankingException("Application not found", 404));
        if (app.getStatus() != LoanApplication.LoanApplicationStatus.SUBMITTED &&
            app.getStatus() != LoanApplication.LoanApplicationStatus.UNDER_REVIEW)
            throw new BankingException("Application cannot be reviewed in current state", 400);

        User reviewer = userRepo.findById(reviewerId).orElseThrow();
        app.setReviewedBy(reviewer);
        app.setReviewedAt(LocalDateTime.now());
        app.setReviewRemarks(req.remarks);

        if ("APPROVED".equals(req.decision)) {
            app.setStatus(LoanApplication.LoanApplicationStatus.APPROVED);
            disburseLoan(app);
        } else {
            app.setStatus(LoanApplication.LoanApplicationStatus.REJECTED);
        }
        loanAppRepo.save(app);
        notificationService.sendLoanStatusEmail(app);
    }

    private void disburseLoan(LoanApplication app) {
        LoanType lt = app.getLoanType();
        BigDecimal emi = calculateEmi(app.getAmountRequested(), lt.getInterestRate(), app.getTenureMonths());
        LocalDate disbursedAt  = LocalDate.now();
        LocalDate firstEmi     = disbursedAt.plusMonths(1);
        LocalDate lastEmi      = firstEmi.plusMonths(app.getTenureMonths() - 1);
        BigDecimal processFee  = app.getAmountRequested()
            .multiply(lt.getProcessingFeePct()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        Loan loan = Loan.builder()
            .loanAccountNumber("LACC" + System.currentTimeMillis())
            .application(app)
            .user(app.getUser())
            .principalAmount(app.getAmountRequested())
            .interestRate(lt.getInterestRate())
            .tenureMonths(app.getTenureMonths())
            .emiAmount(emi)
            .processingFee(processFee)
            .outstandingBalance(app.getAmountRequested())
            .disbursedAt(disbursedAt)
            .firstEmiDate(firstEmi)
            .lastEmiDate(lastEmi)
            .status(Loan.LoanStatus.ACTIVE)
            .build();

        loan = loanRepo.save(loan);
        app.setStatus(LoanApplication.LoanApplicationStatus.DISBURSED);
        generateEmiSchedule(loan);
    }

    private void generateEmiSchedule(Loan loan) {
        BigDecimal balance    = loan.getPrincipalAmount();
        BigDecimal monthRate  = loan.getInterestRate().divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        List<EmiSchedule> emis = new ArrayList<>();

        for (int i = 1; i <= loan.getTenureMonths(); i++) {
            BigDecimal interest   = balance.multiply(monthRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal  = loan.getEmiAmount().subtract(interest).setScale(2, RoundingMode.HALF_UP);
            if (i == loan.getTenureMonths()) { principal = balance; }
            balance = balance.subtract(principal).max(BigDecimal.ZERO);

            emis.add(EmiSchedule.builder()
                .loan(loan)
                .emiNumber(i)
                .dueDate(loan.getFirstEmiDate().plusMonths(i - 1))
                .emiAmount(loan.getEmiAmount())
                .principalComponent(principal)
                .interestComponent(interest)
                .outstandingAfter(balance)
                .status(EmiSchedule.EmiStatus.UPCOMING)
                .build());
        }
        emiRepo.saveAll(emis);
    }

    public static BigDecimal calculateEmi(BigDecimal principal, BigDecimal annualRate, int months) {
        BigDecimal r = annualRate.divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        double rd = r.doubleValue();
        double pd = principal.doubleValue();
        double emi = pd * rd * Math.pow(1 + rd, months) / (Math.pow(1 + rd, months) - 1);
        return BigDecimal.valueOf(emi).setScale(2, RoundingMode.HALF_UP);
    }

    private LoanApplicationResponse mapAppToResponse(LoanApplication a, BigDecimal rate) {
        BigDecimal emi = calculateEmi(a.getAmountRequested(), rate, a.getTenureMonths());
        return LoanApplicationResponse.builder()
            .id(a.getId())
            .applicationNo(a.getApplicationNo())
            .loanType(a.getLoanType().getTypeName())
            .amountRequested(a.getAmountRequested())
            .tenureMonths(a.getTenureMonths())
            .status(a.getStatus().name())
            .emiEstimate(emi)
            .purpose(a.getPurpose())
            .submittedAt(a.getSubmittedAt())
            .createdAt(a.getCreatedAt())
            .build();
    }

    private LoanResponse mapLoanToResponse(Loan l) {
        List<EmiSchedule> emis = l.getEmiSchedules();
        return LoanResponse.builder()
            .id(l.getId())
            .loanAccountNumber(l.getLoanAccountNumber())
            .principalAmount(l.getPrincipalAmount())
            .interestRate(l.getInterestRate())
            .tenureMonths(l.getTenureMonths())
            .emiAmount(l.getEmiAmount())
            .outstandingBalance(l.getOutstandingBalance())
            .disbursedAt(l.getDisbursedAt())
            .lastEmiDate(l.getLastEmiDate())
            .status(l.getStatus().name())
            .totalEmis(l.getTenureMonths())
            .paidEmis((int) emis.stream().filter(e -> e.getStatus() == EmiSchedule.EmiStatus.PAID).count())
            .overdueEmis((int) emis.stream().filter(e -> e.getStatus() == EmiSchedule.EmiStatus.OVERDUE).count())
            .build();
    }

    private EmiScheduleResponse mapEmiToResponse(EmiSchedule e) {
        return EmiScheduleResponse.builder()
            .emiNumber(e.getEmiNumber())
            .dueDate(e.getDueDate())
            .emiAmount(e.getEmiAmount())
            .principalComponent(e.getPrincipalComponent())
            .interestComponent(e.getInterestComponent())
            .outstandingAfter(e.getOutstandingAfter())
            .paidAmount(e.getPaidAmount())
            .status(e.getStatus().name())
            .paidAt(e.getPaidAt())
            .build();
    }

    public LoanRepository getLoanRepo() {
        return loanRepo;
    }

    public List<LoanApplicationResponse> getUserApplications(Long userId) {
        return loanAppRepo.findByUserId(userId).stream()
                .map(app -> {
                    BigDecimal emi = LoanService.calculateEmi(
                            app.getAmountRequested(),
                            app.getLoanType().getInterestRate(),
                            app.getTenureMonths());
                    return LoanApplicationResponse.builder()
                            .id(app.getId())
                            .applicationNo(app.getApplicationNo())
                            .loanType(app.getLoanType().getTypeName())
                            .amountRequested(app.getAmountRequested())
                            .tenureMonths(app.getTenureMonths())
                            .status(app.getStatus().name())
                            .emiEstimate(emi)
                            .purpose(app.getPurpose())
                            .submittedAt(app.getSubmittedAt())
                            .createdAt(app.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse payEmi(Long loanId, Long accountId, Long userId) {
        Loan loan = loanRepo.findById(loanId)
                .orElseThrow(() -> new BankingException("Loan not found", 404));
        if (!loan.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);

        // Find next unpaid EMI
        EmiSchedule emi = emiRepo.findByLoanIdAndStatus(loanId, EmiSchedule.EmiStatus.UPCOMING)
                .stream()
                .min(Comparator.comparing(EmiSchedule::getDueDate))
                .orElse(null);

        if (emi == null) {
            emi = emiRepo.findByLoanIdAndStatus(loanId, EmiSchedule.EmiStatus.OVERDUE)
                    .stream()
                    .min(Comparator.comparing(EmiSchedule::getDueDate))
                    .orElseThrow(() -> new BankingException("No pending EMI found", 400));
        }

        Account account = accountRepo.findById(accountId)
                .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!account.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);
        if (account.getAvailableBalance().compareTo(emi.getEmiAmount()) < 0)
            throw new BankingException("Insufficient balance to pay EMI", 400);

        // Deduct balance
        BigDecimal before = account.getBalance();
        account.setBalance(before.subtract(emi.getEmiAmount()));
        account.setAvailableBalance(account.getAvailableBalance().subtract(emi.getEmiAmount()));
        account.setLastTransactionAt(java.time.LocalDateTime.now());
        accountRepo.save(account);

        // Create transaction
        Transaction txn = Transaction.builder()
                .transactionRef("EMI" + System.currentTimeMillis())
                .fromAccount(account)
                .transactionType(Transaction.TransactionType.EMI_DEBIT)
                .amount(emi.getEmiAmount())
                .balanceBefore(before)
                .balanceAfter(account.getBalance())
                .description("EMI #" + emi.getEmiNumber() + " for loan " + loan.getLoanAccountNumber())
                .status(Transaction.TransactionStatus.SUCCESS)
                .channel(Transaction.Channel.NETBANKING)
                .initiatedAt(java.time.LocalDateTime.now())
                .completedAt(java.time.LocalDateTime.now())
                .build();
        txn = txnRepo.save(txn);

        // Update EMI
        emi.setStatus(EmiSchedule.EmiStatus.PAID);
        emi.setPaidAmount(emi.getEmiAmount());
        emi.setPaidAt(java.time.LocalDateTime.now());
        emi.setTransaction(txn);
        emiRepo.save(emi);

        // Update outstanding balance
        loan.setOutstandingBalance(loan.getOutstandingBalance().subtract(emi.getPrincipalComponent()));
        if (loan.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            loan.setOutstandingBalance(BigDecimal.ZERO);
            loan.setStatus(Loan.LoanStatus.CLOSED);
        }
        loanRepo.save(loan);

        return TransactionResponse.builder()
                .id(txn.getId())
                .transactionRef(txn.getTransactionRef())
                .transactionType(txn.getTransactionType().name())
                .amount(txn.getAmount())
                .status(txn.getStatus().name())
                .description(txn.getDescription())
                .balanceBefore(txn.getBalanceBefore())
                .balanceAfter(txn.getBalanceAfter())
                .initiatedAt(txn.getInitiatedAt())
                .build();
    }
}

// ============================================================
// Notification Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class NotificationService {
    private final NotificationRepository notifRepo;
    private final JavaMailSender mailSender;

    @Async
    public void sendWelcomeEmail(User user) {
        sendEmail(user.getEmail(),
            "Welcome to Banking Management System!",
            "<h2>Welcome, " + user.getFirstName() + "!</h2><p>Your account has been created successfully.</p>");
        saveInApp(user, "Welcome!", "Your account was created successfully.");
    }

    @Async
    public void sendTransactionAlert(User user, Transaction txn) {
        String msg = String.format("Transaction of ₹%.2f [%s] on your account. Ref: %s",
            txn.getAmount(), txn.getTransactionType(), txn.getTransactionRef());
        sendEmail(user.getEmail(), "Transaction Alert", "<p>" + msg + "</p>");
        saveInApp(user, "Transaction Alert", msg);
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        String link = "http://localhost:3000/reset-password?token=" + token;
        sendEmail(user.getEmail(), "Password Reset Request",
            "<p>Click <a href='" + link + "'>here</a> to reset your password. Link expires in 1 hour.</p>");
    }

    @Async
    public void sendLoanStatusEmail(LoanApplication app) {
        String status = app.getStatus().name();
        sendEmail(app.getUser().getEmail(), "Loan Application Update",
            "<p>Your loan application " + app.getApplicationNo() + " has been <strong>" + status + "</strong>.</p>");
        saveInApp(app.getUser(), "Loan Status Update", "Your loan application is now " + status);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            var msg = mailSender.createMimeMessage();
            var helper = new MimeMessageHelper(msg, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private void saveInApp(User user, String title, String message) {
        notifRepo.save(Notification.builder()
            .user(user).title(title).message(message)
            .channel(Notification.NotificationChannel.IN_APP)
            .status(Notification.NotificationStatus.SENT)
            .sentAt(LocalDateTime.now())
            .build());
    }

    public Page<NotificationResponse> getNotifications(Long userId, int page, int size) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
            .map(n -> NotificationResponse.builder()
                .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .channel(n.getChannel().name()).status(n.getStatus().name())
                .createdAt(n.getCreatedAt()).readAt(n.getReadAt()).build());
    }

    public long getUnreadCount(Long userId) {
        return notifRepo.countByUserIdAndStatus(userId, Notification.NotificationStatus.SENT);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifRepo.findPendingByUser(userId).forEach(n -> {
            n.setStatus(Notification.NotificationStatus.READ);
            n.setReadAt(LocalDateTime.now());
            notifRepo.save(n);
        });
    }
}
