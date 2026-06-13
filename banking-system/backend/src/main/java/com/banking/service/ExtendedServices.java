package com.banking.service;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.BankingException;
import com.banking.repository.*;
import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

// RoleRepository is now imported from com.banking.repository

// ============================================================
// User Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class UserService {
    private final UserRepository userRepo;
    private final KycRepository kycRepo;
    private final BeneficiaryRepository benefRepo;
    private final AuthService authService;

    @Value("${banking.upload.dir:./uploads}")
    private String uploadDir;

    public UserResponse getProfile(Long userId) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        UserResponse r = authService.mapToUserResponse(u);
        kycRepo.findByUserId(userId).ifPresent(k -> r.setKycStatus(k.getKycStatus().name()));
        return r;
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        if (req.firstName != null) u.setFirstName(req.firstName);
        if (req.lastName  != null) u.setLastName(req.lastName);
        if (req.phone     != null) u.setPhone(req.phone);
        if (req.gender    != null) u.setGender(User.Gender.valueOf(req.gender));
        return authService.mapToUserResponse(userRepo.save(u));
    }

    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(dir);
            String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/avatars/" + filename;
            User u = userRepo.findById(userId).orElseThrow();
            u.setProfilePictureUrl(url);
            userRepo.save(u);
            return url;
        } catch (IOException e) {
            throw new BankingException("Failed to upload file", 500);
        }
    }

    @Transactional
    public void submitKyc(Long userId, KycRequest req) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        KycDetails kyc = kycRepo.findByUserId(userId).orElse(KycDetails.builder().user(u).build());
        kyc.setAadhaarNumber(req.aadhaarNumber);
        kyc.setPanNumber(req.panNumber);
        kyc.setAddressLine1(req.addressLine1);
        kyc.setAddressLine2(req.addressLine2);
        kyc.setCity(req.city);
        kyc.setState(req.state);
        kyc.setPincode(req.pincode);
        kyc.setKycStatus(KycDetails.KycStatus.SUBMITTED);
        kycRepo.save(kyc);
    }

    public Map<String, Object> getKycStatus(Long userId) {
        return kycRepo.findByUserId(userId).map(k -> Map.<String,Object>of(
            "status", k.getKycStatus().name(),
            "city", k.getCity(),
            "state", k.getState(),
            "verifiedAt", k.getVerifiedAt() != null ? k.getVerifiedAt().toString() : null
        )).orElse(Map.of("status", "NOT_SUBMITTED"));
    }

    public List<BeneficiaryResponse> getBeneficiaries(Long userId) {
        return benefRepo.findByUserIdAndIsActiveTrue(userId).stream().map(b ->
            BeneficiaryResponse.builder()
                .id(b.getId()).nickname(b.getNickname())
                .accountNumber(b.getAccountNumber()).ifscCode(b.getIfscCode())
                .bankName(b.getBankName()).beneficiaryName(b.getBeneficiaryName())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(Long userId, AddBeneficiaryRequest req) {
        if (benefRepo.existsByUserIdAndAccountNumber(userId, req.accountNumber))
            throw new BankingException("Beneficiary already exists", 409);
        User u = userRepo.findById(userId).orElseThrow();
        Beneficiary b = Beneficiary.builder()
            .user(u).nickname(req.nickname).accountNumber(req.accountNumber)
            .ifscCode(req.ifscCode).bankName(req.bankName).beneficiaryName(req.beneficiaryName)
            .isActive(true).build();
        b = benefRepo.save(b);
        return BeneficiaryResponse.builder()
            .id(b.getId()).nickname(b.getNickname()).accountNumber(b.getAccountNumber())
            .ifscCode(b.getIfscCode()).bankName(b.getBankName()).beneficiaryName(b.getBeneficiaryName())
            .build();
    }

    @Transactional
    public void removeBeneficiary(Long userId, Long benefId) {
        Beneficiary b = benefRepo.findById(benefId).orElseThrow(() -> new BankingException("Beneficiary not found", 404));
        if (!b.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        b.setIsActive(false);
        benefRepo.save(b);
    }
}

// ============================================================
// Card Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class CardService {
    private final CardRepository cardRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public CardResponse requestCard(Long userId, CardRequest req) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId))
            throw new BankingException("Unauthorized", 403);

        Card.CardType cardType = Card.CardType.valueOf(req.cardType);
        if (cardRepo.existsByUserIdAndCardTypeAndStatusNot(userId, cardType, Card.CardStatus.CANCELLED))
            throw new BankingException("You already have an active " + req.cardType + " card request", 409);

        User u = userRepo.findById(userId).orElseThrow();
        String maskedNumber = "XXXXXXXXXXXX" + (1000 + (int)(Math.random() * 9000));

        Card card = Card.builder()
            .cardNumber(maskedNumber)
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

    public CardResponse updateSettings(Long userId, Long cardId, Map<String, Boolean> settings) {
        Card card = getAndValidate(userId, cardId);
        if (settings.containsKey("isOnlineEnabled"))         card.setIsOnlineEnabled(settings.get("isOnlineEnabled"));
        if (settings.containsKey("isInternationalEnabled"))  card.setIsInternationalEnabled(settings.get("isInternationalEnabled"));
        if (settings.containsKey("isContactlessEnabled"))    card.setIsContactlessEnabled(settings.get("isContactlessEnabled"));
        return mapToResponse(cardRepo.save(card));
    }

    public Map<String, Object> getAnalytics(Long userId, Long cardId) {
        Card card = getAndValidate(userId, cardId);
        // Simple analytics based on transactions
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
            .build();
    }
}

// ============================================================
// UPI Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class UpiService {
    private final UpiRepository upiRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final TransactionService txnService;
    private final TransactionRepository txnRepo;

    @Transactional
    public UpiResponse createUpiId(Long userId, CreateUpiRequest req) {
        if (upiRepo.existsByUpiId(req.upiId))
            throw new BankingException("UPI ID already taken", 409);
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        User u = userRepo.findById(userId).orElseThrow();

        boolean isFirst = upiRepo.findByUserIdAndIsActiveTrue(userId).isEmpty();
        UpiId upi = UpiId.builder()
            .user(u).account(acc).upiId(req.upiId)
            .isDefault(isFirst).isActive(true).build();
        upi = upiRepo.save(upi);
        return mapToResponse(upi);
    }

    public List<UpiResponse> getUserUpiIds(Long userId) {
        return upiRepo.findByUserIdAndIsActiveTrue(userId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public byte[] generateQrCode(String upiId, Long userId) {
        UpiId upi = upiRepo.findByUpiId(upiId)
            .orElseThrow(() -> new BankingException("UPI ID not found", 404));
        if (!upi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        try {
            String upiString = "upi://pay?pa=" + upiId + "&pn=" + upi.getUser().getFirstName();
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(upiString, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("QR generation failed", 500);
        }
    }

    @Transactional
    public TransactionResponse sendMoney(Long userId, UpiTransferRequest req) {
        UpiId fromUpi = upiRepo.findByUpiId(req.fromUpiId)
            .orElseThrow(() -> new BankingException("Sender UPI ID not found", 404));
        UpiId toUpi = upiRepo.findByUpiId(req.toUpiId)
            .orElseThrow(() -> new BankingException("Receiver UPI ID not found", 404));
        if (!fromUpi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);

        FundTransferRequest transferReq = new FundTransferRequest(
            fromUpi.getAccount().getId(),
            toUpi.getAccount().getAccountNumber(),
            req.amount, req.description);
        return txnService.transfer(transferReq, userId);
    }

    public Map<String, Object> requestMoney(Long userId, Map<String, Object> req) {
        // Create payment request record and return details
        return Map.of(
            "requestId", UUID.randomUUID().toString(),
            "status", "PENDING",
            "message", "Payment request sent"
        );
    }

    public Page<TransactionResponse> getUpiHistory(Long userId, int page, int size) {
        return txnRepo.findUpiByUserId(userId, PageRequest.of(page, size))
            .map(txnService::mapToResponse);
    }

    @Transactional
    public void deleteUpiId(Long userId, Long upiId) {
        UpiId upi = upiRepo.findById(upiId)
            .orElseThrow(() -> new BankingException("UPI ID not found", 404));
        if (!upi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        upi.setIsActive(false);
        upiRepo.save(upi);
    }

    private UpiResponse mapToResponse(UpiId u) {
        return UpiResponse.builder()
            .id(u.getId()).upiId(u.getUpiId()).qrCodeUrl(u.getQrCodeUrl())
            .isDefault(u.getIsDefault()).isActive(u.getIsActive())
            .linkedAccountNumber(u.getAccount().getAccountNumber())
            .build();
    }
}

// ============================================================
// Admin Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class AdminService {
    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;
    private final LoanApplicationRepository loanAppRepo;
    private final KycRepository kycRepo;
    private final BranchRepository branchRepo;
    private final LoanService loanService;
    private final AuthService authService;

    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
            .totalCustomers(userRepo.countByRole("ROLE_CUSTOMER"))
            .totalAccounts(accountRepo.count())
            .totalTransactionsToday(txnRepo.countTodaySuccess())
            .totalTransactionValueToday(txnRepo.sumTodayAmount())
            .pendingLoanApplications(loanAppRepo.countByStatus(LoanApplication.LoanApplicationStatus.SUBMITTED))
            .pendingKycVerifications(kycRepo.countByKycStatus(KycDetails.KycStatus.SUBMITTED))
            .activeLoans(loanService.getLoanRepo().countByStatus(Loan.LoanStatus.ACTIVE))
            .totalBranches(branchRepo.count())
            .build();
    }

    public Page<UserResponse> getCustomers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepo.findCustomers(search, pageable).map(authService::mapToUserResponse);
    }

    public UserResponse getCustomerById(Long id) {
        return authService.mapToUserResponse(
            userRepo.findById(id).orElseThrow(() -> new BankingException("User not found", 404)));
    }

    @Transactional
    public void setCustomerActive(Long id, boolean active) {
        User u = userRepo.findById(id).orElseThrow(() -> new BankingException("User not found", 404));
        u.setIsActive(active);
        userRepo.save(u);
    }

    @Transactional
    public void unlockCustomer(Long id) {
        User u = userRepo.findById(id).orElseThrow(() -> new BankingException("User not found", 404));
        u.setIsLocked(false);
        u.setFailedLoginCount(0);
        userRepo.save(u);
    }

    public Page<Map<String,Object>> getPendingKyc(int page, int size) {
        return kycRepo.findByKycStatus(KycDetails.KycStatus.SUBMITTED, PageRequest.of(page, size))
            .map(k -> Map.<String,Object>of(
                "kycId", k.getId(),
                "userId", k.getUser().getId(),
                "name", k.getUser().getFirstName() + " " + k.getUser().getLastName(),
                "email", k.getUser().getEmail(),
                "aadhaar", k.getAadhaarNumber(),
                "pan", k.getPanNumber(),
                "city", k.getCity(), "state", k.getState(),
                "submittedAt", k.getUpdatedAt().toString()
            ));
    }

    @Transactional
    public void verifyKyc(Long kycId, Long adminId, String status, String remarks) {
        KycDetails kyc = kycRepo.findById(kycId).orElseThrow(() -> new BankingException("KYC not found", 404));
        User admin = userRepo.findById(adminId).orElseThrow();
        kyc.setKycStatus(KycDetails.KycStatus.valueOf(status));
        kyc.setVerifiedBy(admin);
        kyc.setRemarks(remarks);
        if ("VERIFIED".equals(status)) kyc.setVerifiedAt(LocalDateTime.now());
        kycRepo.save(kyc);
    }

    public Page<LoanApplicationResponse> getPendingLoans(int page, int size) {
        return loanAppRepo.findByStatus(LoanApplication.LoanApplicationStatus.SUBMITTED, PageRequest.of(page, size))
            .map(a -> LoanApplicationResponse.builder()
                .id(a.getId()).applicationNo(a.getApplicationNo())
                .loanType(a.getLoanType().getTypeName())
                .amountRequested(a.getAmountRequested())
                .tenureMonths(a.getTenureMonths())
                .status(a.getStatus().name())
                .purpose(a.getPurpose())
                .submittedAt(a.getSubmittedAt())
                .build());
    }

    public void reviewLoan(LoanReviewRequest req, Long reviewerId) {
        loanService.reviewLoan(req, reviewerId);
    }

    public Page<TransactionResponse> getAllTransactions(int page, int size) {
        return txnRepo.findAll(PageRequest.of(page, size, Sort.by("initiatedAt").descending()))
            .map(t -> TransactionResponse.builder()
                .id(t.getId()).transactionRef(t.getTransactionRef())
                .transactionType(t.getTransactionType().name())
                .amount(t.getAmount()).status(t.getStatus().name())
                .initiatedAt(t.getInitiatedAt()).build());
    }

    public Map<String, Object> getSummaryReport(String from, String to) {
        LocalDate f = LocalDate.parse(from);
        LocalDate t = LocalDate.parse(to);
        return Map.of(
            "from", from, "to", to,
            "totalTransactions", txnRepo.countByDateRange(f.atStartOfDay(), t.atTime(23,59,59)),
            "totalAmount", txnRepo.sumByDateRange(f.atStartOfDay(), t.atTime(23,59,59)),
            "newAccounts", accountRepo.countOpenedBetween(f, t),
            "newCustomers", userRepo.countRegisteredBetween(f.atStartOfDay(), t.atTime(23,59,59))
        );
    }

    public Page<AccountResponse> getAllAccounts(int page, int size) {
        AccountService accSvc = getAccountService();
        return accountRepo.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()))
            .map(accSvc::mapToResponse);
    }

    @Transactional
    public void setAccountStatus(Long id, String status) {
        Account acc = accountRepo.findById(id).orElseThrow(() -> new BankingException("Account not found", 404));
        acc.setStatus(Account.AccountStatus.valueOf(status));
        accountRepo.save(acc);
    }

    public List<Branch> getAllBranches() { return branchRepo.findAll(); }

    @Transactional
    public Branch createBranch(Branch branch) { return branchRepo.save(branch); }

    public Page<UserResponse> getEmployees(int page, int size) {
        return userRepo.findEmployees(PageRequest.of(page, size)).map(authService::mapToUserResponse);
    }

    // Lazy inject to avoid circular dependency
    private AccountService getAccountService() { return new AccountService(accountRepo, null, branchRepo, userRepo); }
}

// ============================================================
// Statement / PDF Service
// ============================================================
@Service @RequiredArgsConstructor @Slf4j
public class StatementService {
    private final AccountRepository accountRepo;
    private final TransactionRepository txnRepo;

    public byte[] generateStatementPdf(Long userId, StatementRequest req) {
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);

        List<Transaction> txns = txnRepo.findByAccountAndDateRange(
            req.accountId,
            req.fromDate.atStartOfDay(),
            req.toDate.atTime(23, 59, 59),
            Pageable.unpaged()).getContent();

        try {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, baos);
            doc.open();

            // Header
            Font titleFont  = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD);
            Font headerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 9);

            Paragraph title = new Paragraph("ACCOUNT STATEMENT", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);
            doc.add(new Paragraph(" "));

            // Account info table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            addCell(infoTable, "Account Number:", headerFont);
            addCell(infoTable, acc.getAccountNumber(), normalFont);
            addCell(infoTable, "Account Holder:", headerFont);
            addCell(infoTable, acc.getUser().getFirstName() + " " + acc.getUser().getLastName(), normalFont);
            addCell(infoTable, "Branch:", headerFont);
            addCell(infoTable, acc.getBranch().getBranchName(), normalFont);
            addCell(infoTable, "IFSC:", headerFont);
            addCell(infoTable, acc.getBranch().getIfscCode(), normalFont);
            addCell(infoTable, "Period:", headerFont);
            addCell(infoTable, req.fromDate + " to " + req.toDate, normalFont);
            addCell(infoTable, "Current Balance:", headerFont);
            addCell(infoTable, "₹" + acc.getBalance(), normalFont);
            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            // Transactions table
            PdfPTable txnTable = new PdfPTable(6);
            txnTable.setWidthPercentage(100);
            txnTable.setWidths(new float[]{2f, 3f, 2f, 1.5f, 1.5f, 1.5f});

            String[] headers = {"Date", "Description", "Ref No", "Debit", "Credit", "Balance"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
                cell.setPadding(5);
                txnTable.addCell(cell);
            }

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            for (Transaction t : txns) {
                txnTable.addCell(new Phrase(t.getInitiatedAt().format(fmt), normalFont));
                txnTable.addCell(new Phrase(t.getDescription() != null ? t.getDescription() : t.getTransactionType().name(), normalFont));
                txnTable.addCell(new Phrase(t.getTransactionRef(), normalFont));
                boolean isDebit = t.getFromAccount() != null && t.getFromAccount().getId().equals(req.accountId);
                txnTable.addCell(new Phrase(isDebit ? "₹" + t.getAmount() : "-", normalFont));
                txnTable.addCell(new Phrase(!isDebit ? "₹" + t.getAmount() : "-", normalFont));
                txnTable.addCell(new Phrase(t.getBalanceAfter() != null ? "₹" + t.getBalanceAfter() : "-", normalFont));
            }

            doc.add(txnTable);
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("This is a system-generated statement. No signature required.", normalFont));
            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("Failed to generate statement: " + e.getMessage(), 500);
        }
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setBorder(Rectangle.NO_BORDER);
        table.addCell(cell);
    }
}
