package com.banking.service;

import com.banking.dto.EmiScheduleResponse;
import com.banking.dto.LoanApplicationRequest;
import com.banking.dto.LoanApplicationResponse;
import com.banking.dto.LoanCalculatorResponse;
import com.banking.dto.LoanResponse;
import com.banking.dto.LoanReviewRequest;
import com.banking.dto.TransactionResponse;
import com.banking.entity.Account;
import com.banking.entity.EmiSchedule;
import com.banking.entity.Loan;
import com.banking.entity.LoanApplication;
import com.banking.entity.LoanType;
import com.banking.entity.Transaction;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.EmiScheduleRepository;
import com.banking.repository.LoanApplicationRepository;
import com.banking.repository.LoanRepository;
import com.banking.repository.LoanTypeRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

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

        BigDecimal before = account.getBalance();
        account.setBalance(before.subtract(emi.getEmiAmount()));
        account.setAvailableBalance(account.getAvailableBalance().subtract(emi.getEmiAmount()));
        account.setLastTransactionAt(java.time.LocalDateTime.now());
        accountRepo.save(account);

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

        emi.setStatus(EmiSchedule.EmiStatus.PAID);
        emi.setPaidAmount(emi.getEmiAmount());
        emi.setPaidAt(java.time.LocalDateTime.now());
        emi.setTransaction(txn);
        emiRepo.save(emi);

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
