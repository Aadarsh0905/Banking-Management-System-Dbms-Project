package com.banking.service;

import com.banking.dto.AccountResponse;
import com.banking.dto.OpenAccountRequest;
import com.banking.entity.Account;
import com.banking.entity.AccountType;
import com.banking.entity.Branch;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.AccountTypeRepository;
import com.banking.repository.BranchRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

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
