package com.banking.config;

import com.banking.entity.*;
import com.banking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final BranchRepository branchRepo;
    private final AccountTypeRepository accountTypeRepo;
    private final LoanTypeRepository loanTypeRepo;
    private final UserRepository userRepo;
    private final AccountRepository accountRepo;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking database configuration and seeding state...");

        try {
            entityManager.createNativeQuery("ALTER TABLE accounts MODIFY COLUMN status VARCHAR(30) DEFAULT 'PENDING'")
                .executeUpdate();
            log.info("Successfully altered accounts table status column to VARCHAR(30).");
        } catch (Exception e) {
            log.warn("Could not alter accounts table status column: {}", e.getMessage());
        }

        // 1. Seed Roles individually
        if (roleRepo.findByName("ROLE_CUSTOMER").isEmpty()) {
            log.info("Seeding ROLE_CUSTOMER...");
            roleRepo.save(Role.builder().name("ROLE_CUSTOMER").description("Regular bank customer").build());
        }
        if (roleRepo.findByName("ROLE_ADMIN").isEmpty()) {
            log.info("Seeding ROLE_ADMIN...");
            roleRepo.save(Role.builder().name("ROLE_ADMIN").description("Bank administrator").build());
        }
        if (roleRepo.findByName("ROLE_EMPLOYEE").isEmpty()) {
            log.info("Seeding ROLE_EMPLOYEE...");
            roleRepo.save(Role.builder().name("ROLE_EMPLOYEE").description("Bank employee").build());
        }

        // Fetch roles for other entities
        Role customerRole = roleRepo.findByName("ROLE_CUSTOMER")
            .orElseThrow(() -> new IllegalStateException("ROLE_CUSTOMER not found"));
        Role adminRole = roleRepo.findByName("ROLE_ADMIN")
            .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found"));
        Role employeeRole = roleRepo.findByName("ROLE_EMPLOYEE")
            .orElseThrow(() -> new IllegalStateException("ROLE_EMPLOYEE not found"));

        // 2. Seed Branches individually
        if (branchRepo.findByBranchCode("BR001").isEmpty()) {
            log.info("Seeding Main Branch (BR001)...");
            branchRepo.save(Branch.builder()
                .branchCode("BR001")
                .branchName("Main Branch")
                .address("1 MG Road, Connaught Place")
                .city("New Delhi")
                .state("Delhi")
                .pincode("110001")
                .phone("011-12345678")
                .email("main@bank.com")
                .ifscCode("BANK0000001")
                .isActive(true)
                .build());
        }
        if (branchRepo.findByBranchCode("BR002").isEmpty()) {
            log.info("Seeding South Delhi Branch (BR002)...");
            branchRepo.save(Branch.builder()
                .branchCode("BR002")
                .branchName("South Delhi Branch")
                .address("15 Lajpat Nagar")
                .city("New Delhi")
                .state("Delhi")
                .pincode("110024")
                .phone("011-23456789")
                .email("south@bank.com")
                .ifscCode("BANK0000002")
                .isActive(true)
                .build());
        }
        if (branchRepo.findByBranchCode("BR003").isEmpty()) {
            log.info("Seeding Mumbai Main Branch (BR003)...");
            branchRepo.save(Branch.builder()
                .branchCode("BR003")
                .branchName("Mumbai Main")
                .address("42 Nariman Point")
                .city("Mumbai")
                .state("Maharashtra")
                .pincode("400021")
                .phone("022-34567890")
                .email("mumbai@bank.com")
                .ifscCode("BANK0000003")
                .isActive(true)
                .build());
        }

        // 3. Seed Account Types individually
        if (accountTypeRepo.findByTypeCode("SAVINGS").isEmpty()) {
            log.info("Seeding Account Type: SAVINGS...");
            accountTypeRepo.save(AccountType.builder()
                .typeCode("SAVINGS")
                .typeName("Savings Account")
                .interestRate(new BigDecimal("3.50"))
                .minBalance(new BigDecimal("1000.00"))
                .description("Regular savings account with interest")
                .isActive(true)
                .build());
        }
        if (accountTypeRepo.findByTypeCode("CURRENT").isEmpty()) {
            log.info("Seeding Account Type: CURRENT...");
            accountTypeRepo.save(AccountType.builder()
                .typeCode("CURRENT")
                .typeName("Current Account")
                .interestRate(BigDecimal.ZERO)
                .minBalance(new BigDecimal("5000.00"))
                .description("Current account for business transactions")
                .isActive(true)
                .build());
        }
        if (accountTypeRepo.findByTypeCode("FIXED_DEPOSIT").isEmpty()) {
            log.info("Seeding Account Type: FIXED_DEPOSIT...");
            accountTypeRepo.save(AccountType.builder()
                .typeCode("FIXED_DEPOSIT")
                .typeName("Fixed Deposit Account")
                .interestRate(new BigDecimal("6.50"))
                .minBalance(new BigDecimal("10000.00"))
                .description("Fixed deposit with higher interest")
                .isActive(true)
                .build());
        }

        // 4. Seed Loan Types individually
        if (loanTypeRepo.findByTypeCode("PERSONAL").isEmpty()) {
            log.info("Seeding Loan Type: PERSONAL...");
            loanTypeRepo.save(LoanType.builder()
                .typeCode("PERSONAL")
                .typeName("Personal Loan")
                .minAmount(new BigDecimal("10000.00"))
                .maxAmount(new BigDecimal("500000.00"))
                .minTenureMonths(12)
                .maxTenureMonths(60)
                .interestRate(new BigDecimal("10.50"))
                .processingFeePct(new BigDecimal("1.00"))
                .isActive(true)
                .build());
        }
        if (loanTypeRepo.findByTypeCode("HOME").isEmpty()) {
            log.info("Seeding Loan Type: HOME...");
            loanTypeRepo.save(LoanType.builder()
                .typeCode("HOME")
                .typeName("Home Loan")
                .minAmount(new BigDecimal("500000.00"))
                .maxAmount(new BigDecimal("10000000.00"))
                .minTenureMonths(60)
                .maxTenureMonths(360)
                .interestRate(new BigDecimal("8.50"))
                .processingFeePct(new BigDecimal("0.50"))
                .isActive(true)
                .build());
        }
        if (loanTypeRepo.findByTypeCode("EDUCATION").isEmpty()) {
            log.info("Seeding Loan Type: EDUCATION...");
            loanTypeRepo.save(LoanType.builder()
                .typeCode("EDUCATION")
                .typeName("Education Loan")
                .minAmount(new BigDecimal("5000.00"))
                .maxAmount(new BigDecimal("1500000.00"))
                .minTenureMonths(12)
                .maxTenureMonths(84)
                .interestRate(new BigDecimal("9.00"))
                .processingFeePct(BigDecimal.ZERO)
                .isActive(true)
                .build());
        }

        // 5. Seed Users individually
        if (!userRepo.existsByUsername("admin")) {
            log.info("Seeding Admin User...");
            userRepo.save(User.builder()
                .username("admin")
                .email("admin@bank.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .firstName("System")
                .lastName("Admin")
                .phone("9000000000")
                .isActive(true)
                .isLocked(false)
                .emailVerified(true)
                .roles(Set.of(adminRole))
                .build());
        }
        if (!userRepo.existsByUsername("rahul.sharma")) {
            log.info("Seeding Customer User: rahul.sharma...");
            userRepo.save(User.builder()
                .username("rahul.sharma")
                .email("rahul@email.com")
                .passwordHash(passwordEncoder.encode("Customer@123"))
                .firstName("Rahul")
                .lastName("Sharma")
                .phone("9876543210")
                .dateOfBirth(LocalDate.of(1990, 5, 15))
                .gender(User.Gender.MALE)
                .isActive(true)
                .isLocked(false)
                .emailVerified(true)
                .roles(Set.of(customerRole))
                .build());
        }
        if (!userRepo.existsByUsername("priya.patel")) {
            log.info("Seeding Customer User: priya.patel...");
            userRepo.save(User.builder()
                .username("priya.patel")
                .email("priya@email.com")
                .passwordHash(passwordEncoder.encode("Customer@123"))
                .firstName("Priya")
                .lastName("Patel")
                .phone("9876543211")
                .dateOfBirth(LocalDate.of(1992, 8, 22))
                .gender(User.Gender.FEMALE)
                .isActive(true)
                .isLocked(false)
                .emailVerified(true)
                .roles(Set.of(customerRole))
                .build());
        }
        if (!userRepo.existsByUsername("Aadarsh")) {
            log.info("Seeding Customer User: Aadarsh...");
            userRepo.save(User.builder()
                .username("Aadarsh")
                .email("aadarsh@email.com")
                .passwordHash(passwordEncoder.encode("Aadarsh@123"))
                .firstName("Aadarsh")
                .lastName("Ranjan")
                .phone("9876543212")
                .dateOfBirth(LocalDate.of(2000, 1, 1))
                .gender(User.Gender.MALE)
                .isActive(true)
                .isLocked(false)
                .emailVerified(true)
                .roles(Set.of(customerRole))
                .build());
        }


        // Fetch users for seeding accounts
        User rahul = userRepo.findByUsername("rahul.sharma").orElse(null);
        User priya = userRepo.findByUsername("priya.patel").orElse(null);
        User aadarsh = userRepo.findByUsername("Aadarsh").orElse(null);

        // Fetch branches & types for seeding accounts
        Branch mainBranch = branchRepo.findByBranchCode("BR001").orElse(null);
        AccountType savingsType = accountTypeRepo.findByTypeCode("SAVINGS").orElse(null);
        AccountType fdType = accountTypeRepo.findByTypeCode("FIXED_DEPOSIT").orElse(null);

        // 6. Seed Accounts individually
        if (rahul != null && mainBranch != null && savingsType != null) {
            if (accountRepo.findByAccountNumber("ACC1000000001").isEmpty()) {
                log.info("Seeding Account ACC1000000001 for rahul.sharma...");
                accountRepo.save(Account.builder()
                    .accountNumber("ACC1000000001")
                    .user(rahul)
                    .branch(mainBranch)
                    .accountType(savingsType)
                    .balance(new BigDecimal("85000.00"))
                    .availableBalance(new BigDecimal("85000.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .openedAt(LocalDate.of(2022, 3, 10))
                    .build());
            }
            if (fdType != null && accountRepo.findByAccountNumber("ACC1000000004").isEmpty()) {
                log.info("Seeding Account ACC1000000004 for rahul.sharma...");
                accountRepo.save(Account.builder()
                    .accountNumber("ACC1000000004")
                    .user(rahul)
                    .branch(mainBranch)
                    .accountType(fdType)
                    .balance(new BigDecimal("100000.00"))
                    .availableBalance(new BigDecimal("100000.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .openedAt(LocalDate.of(2023, 1, 15))
                    .build());
            }
        }

        if (priya != null && mainBranch != null && savingsType != null) {
            if (accountRepo.findByAccountNumber("ACC1000000002").isEmpty()) {
                log.info("Seeding Account ACC1000000002 for priya.patel...");
                accountRepo.save(Account.builder()
                    .accountNumber("ACC1000000002")
                    .user(priya)
                    .branch(mainBranch)
                    .accountType(savingsType)
                    .balance(new BigDecimal("42500.00"))
                    .availableBalance(new BigDecimal("42500.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .openedAt(LocalDate.of(2022, 5, 20))
                    .build());
            }
        }

        if (aadarsh != null && mainBranch != null && savingsType != null) {
            if (accountRepo.findByAccountNumber("ACC1000000003").isEmpty()) {
                log.info("Seeding Account ACC1000000003 for Aadarsh...");
                accountRepo.save(Account.builder()
                    .accountNumber("ACC1000000003")
                    .user(aadarsh)
                    .branch(mainBranch)
                    .accountType(savingsType)
                    .balance(new BigDecimal("50000.00"))
                    .availableBalance(new BigDecimal("50000.00"))
                    .currency("INR")
                    .status(Account.AccountStatus.ACTIVE)
                    .openedAt(LocalDate.of(2023, 6, 1))
                    .build());
            }
        }

        log.info("Database validation and seeding completed successfully.");
    }
}
