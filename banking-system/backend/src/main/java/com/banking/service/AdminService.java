package com.banking.service;

import com.banking.dto.AccountResponse;
import com.banking.dto.DashboardStats;
import com.banking.dto.LoanApplicationResponse;
import com.banking.dto.LoanReviewRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.UserResponse;
import com.banking.entity.Account;
import com.banking.entity.Branch;
import com.banking.entity.KycDetails;
import com.banking.entity.Loan;
import com.banking.entity.LoanApplication;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.BranchRepository;
import com.banking.repository.KycRepository;
import com.banking.repository.LoanApplicationRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    private AccountService getAccountService() { return new AccountService(accountRepo, null, branchRepo, userRepo); }
}
