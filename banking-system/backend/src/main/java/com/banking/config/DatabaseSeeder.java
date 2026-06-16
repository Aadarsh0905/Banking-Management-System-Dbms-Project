package com.banking.config;

import com.banking.entity.*;
import com.banking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking if database seeding is required...");

        // 1. Seed Roles
        if (roleRepo.count() == 0) {
            log.info("Seeding roles...");
            roleRepo.saveAll(List.of(
                Role.builder().name("ROLE_CUSTOMER").description("Regular bank customer").build(),
                Role.builder().name("ROLE_ADMIN").description("Bank administrator").build(),
                Role.builder().name("ROLE_EMPLOYEE").description("Bank employee").build()
            ));
        }

        // Fetch roles for later use
        Role customerRole = roleRepo.findByName("ROLE_CUSTOMER")
            .orElseThrow(() -> new IllegalStateException("ROLE_CUSTOMER not found"));
        Role adminRole = roleRepo.findByName("ROLE_ADMIN")
            .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN not found"));
        Role employeeRole = roleRepo.findByName("ROLE_EMPLOYEE")
            .orElseThrow(() -> new IllegalStateException("ROLE_EMPLOYEE not found"));

        // 2. Seed Branches
        if (branchRepo.count() == 0) {
            log.info("Seeding branches...");
            branchRepo.saveAll(List.of(
                Branch.builder()
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
                    .build(),
                Branch.builder()
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
                    .build(),
                Branch.builder()
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
                    .build()
            ));
        }

        // 3. Seed Account Types
        if (accountTypeRepo.count() == 0) {
            log.info("Seeding account types...");
            accountTypeRepo.saveAll(List.of(
                AccountType.builder()
                    .typeCode("SAVINGS")
                    .typeName("Savings Account")
                    .interestRate(new BigDecimal("3.50"))
                    .minBalance(new BigDecimal("1000.00"))
                    .description("Regular savings account with interest")
                    .isActive(true)
                    .build(),
                AccountType.builder()
                    .typeCode("CURRENT")
                    .typeName("Current Account")
                    .interestRate(BigDecimal.ZERO)
                    .minBalance(new BigDecimal("5000.00"))
                    .description("Current account for business transactions")
                    .isActive(true)
                    .build(),
                AccountType.builder()
                    .typeCode("FIXED_DEPOSIT")
                    .typeName("Fixed Deposit Account")
                    .interestRate(new BigDecimal("6.50"))
                    .minBalance(new BigDecimal("10000.00"))
                    .description("Fixed deposit with higher interest")
                    .isActive(true)
                    .build()
            ));
        }

        // 4. Seed Loan Types
        if (loanTypeRepo.count() == 0) {
            log.info("Seeding loan types...");
            loanTypeRepo.saveAll(List.of(
                LoanType.builder()
                    .typeCode("PERSONAL")
                    .typeName("Personal Loan")
                    .minAmount(new BigDecimal("10000.00"))
                    .maxAmount(new BigDecimal("500000.00"))
                    .minTenureMonths(12)
                    .maxTenureMonths(60)
                    .interestRate(new BigDecimal("10.50"))
                    .processingFeePct(new BigDecimal("1.00"))
                    .isActive(true)
                    .build(),
                LoanType.builder()
                    .typeCode("HOME")
                    .typeName("Home Loan")
                    .minAmount(new BigDecimal("500000.00"))
                    .maxAmount(new BigDecimal("10000000.00"))
                    .minTenureMonths(60)
                    .maxTenureMonths(360)
                    .interestRate(new BigDecimal("8.50"))
                    .processingFeePct(new BigDecimal("0.50"))
                    .isActive(true)
                    .build(),
                LoanType.builder()
                    .typeCode("EDUCATION")
                    .typeName("Education Loan")
                    .minAmount(new BigDecimal("5000.00"))
                    .maxAmount(new BigDecimal("1500000.00"))
                    .minTenureMonths(12)
                    .maxTenureMonths(84)
                    .interestRate(new BigDecimal("9.00"))
                    .processingFeePct(BigDecimal.ZERO)
                    .isActive(true)
                    .build()
            ));
        }

        // 5. Seed Users
        if (userRepo.count() == 0) {
            log.info("Seeding default users...");
            
            // Default Admin (Admin@123)
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

            // Default Customer: Rahul Sharma (Customer@123)
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

            // Default Customer: Priya Patel (Customer@123)
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

            // Default Employee: Rajesh Kumar (Admin@123)
            userRepo.save(User.builder()
                .username("emp.kumar")
                .email("kumar@bank.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .firstName("Rajesh")
                .lastName("Kumar")
                .phone("9000000001")
                .isActive(true)
                .isLocked(false)
                .emailVerified(true)
                .roles(Set.of(employeeRole))
                .build());
        }

        log.info("Database check & seeding completed.");
    }
}
