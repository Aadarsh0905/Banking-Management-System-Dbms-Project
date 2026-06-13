package com.banking;

import com.banking.dto.*;
import com.banking.entity.*;
import com.banking.exception.BankingException;
import com.banking.repository.*;
import com.banking.service.*;
import com.banking.security.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

// ============================================================
// Auth Service Tests
// ============================================================
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepo;
    @Mock private RoleRepository roleRepo;
    @Mock private AuthenticationManager authManager;
    @Mock private JwtUtil jwtUtil;
    @Mock private BankUserDetailsService userDetailsService;
    @Mock private NotificationService notifService;
    @InjectMocks private AuthService authService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();

    private User buildUser() {
        Role role = Role.builder().id(1L).name("ROLE_CUSTOMER").build();
        return User.builder()
            .id(1L).username("testuser").email("test@email.com")
            .passwordHash(encoder.encode("Password@1"))
            .firstName("Test").lastName("User")
            .phone("9876543210").isActive(true).isLocked(false)
            .emailVerified(true).roles(Set.of(role)).build();
    }

    @Test
    @DisplayName("Register: success creates user")
    void register_success() {
        AuthDTOs.RegisterRequest req = new AuthDTOs.RegisterRequest(
            "newuser","new@email.com","Password@1","New","User","9123456789",null,null);
        Role role = Role.builder().id(1L).name("ROLE_CUSTOMER").build();

        when(userRepo.existsByUsername("newuser")).thenReturn(false);
        when(userRepo.existsByEmail("new@email.com")).thenReturn(false);
        when(userRepo.existsByPhone("9123456789")).thenReturn(false);
        when(roleRepo.findByName("ROLE_CUSTOMER")).thenReturn(Optional.of(role));
        when(userRepo.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0); u.setId(2L); return u;
        });
        doNothing().when(notifService).sendWelcomeEmail(any());

        UserResponse result = authService.register(req);
        assertThat(result.username).isEqualTo("newuser");
        assertThat(result.email).isEqualTo("new@email.com");
        verify(userRepo).save(any(User.class));
    }

    @Test
    @DisplayName("Register: duplicate username throws 409")
    void register_duplicateUsername_throws() {
        AuthDTOs.RegisterRequest req = new AuthDTOs.RegisterRequest(
            "testuser","new@email.com","Password@1","Test","User","9123456789",null,null);
        when(userRepo.existsByUsername("testuser")).thenReturn(true);
        assertThatThrownBy(() -> authService.register(req))
            .isInstanceOf(BankingException.class)
            .hasMessageContaining("Username already taken");
    }

    @Test
    @DisplayName("Login: valid credentials returns tokens")
    void login_success() {
        User user = buildUser();
        BankUserDetails ud = new BankUserDetails(user);
        AuthDTOs.LoginRequest req = new AuthDTOs.LoginRequest("testuser","Password@1");

        doNothing().when(authManager).authenticate(any());
        when(userDetailsService.loadUserByUsername("testuser")).thenReturn(ud);
        when(jwtUtil.generateAccessToken(ud)).thenReturn("access-token");
        when(jwtUtil.generateRefreshToken(ud)).thenReturn("refresh-token");
        when(userRepo.save(any())).thenReturn(user);

        AuthDTOs.AuthResponse resp = authService.login(req);
        assertThat(resp.accessToken).isEqualTo("access-token");
        assertThat(resp.refreshToken).isEqualTo("refresh-token");
    }

    @Test
    @DisplayName("Login: bad credentials throws 401")
    void login_badCredentials_throws() {
        AuthDTOs.LoginRequest req = new AuthDTOs.LoginRequest("testuser","wrongpass");
        doThrow(new BadCredentialsException("Bad credentials"))
            .when(authManager).authenticate(any());
        assertThatThrownBy(() -> authService.login(req))
            .isInstanceOf(BankingException.class)
            .extracting("statusCode").isEqualTo(401);
    }

    @Test
    @DisplayName("Login: locked account throws 423")
    void login_lockedAccount_throws() {
        doThrow(new LockedException("Locked")).when(authManager).authenticate(any());
        assertThatThrownBy(() -> authService.login(new AuthDTOs.LoginRequest("u","p")))
            .isInstanceOf(BankingException.class)
            .extracting("statusCode").isEqualTo(423);
    }
}

// ============================================================
// Account Service Tests
// ============================================================
@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock private AccountRepository accountRepo;
    @Mock private AccountTypeRepository accountTypeRepo;
    @Mock private BranchRepository branchRepo;
    @Mock private UserRepository userRepo;
    @InjectMocks private AccountService accountService;

    private User mockUser() {
        return User.builder().id(1L).username("u").email("u@e.com")
            .firstName("A").lastName("B").isActive(true).build();
    }
    private AccountType mockType() {
        return AccountType.builder().id(1L).typeCode("SAVINGS").typeName("Savings Account")
            .interestRate(BigDecimal.valueOf(3.5)).minBalance(BigDecimal.valueOf(1000)).build();
    }
    private Branch mockBranch() {
        return Branch.builder().id(1L).branchCode("BR001").branchName("Main")
            .ifscCode("BANK0000001").city("Delhi").state("Delhi").address("1 MG Road").pincode("110001").build();
    }

    @Test
    @DisplayName("Open account: creates and returns AccountResponse")
    void openAccount_success() {
        User user = mockUser(); AccountType type = mockType(); Branch branch = mockBranch();
        when(userRepo.findById(1L)).thenReturn(Optional.of(user));
        when(accountTypeRepo.findById(1L)).thenReturn(Optional.of(type));
        when(branchRepo.findById(1L)).thenReturn(Optional.of(branch));
        when(accountRepo.findByAccountNumber(any())).thenReturn(Optional.empty());
        when(accountRepo.save(any())).thenAnswer(inv -> {
            Account a = inv.getArgument(0); a.setId(10L); return a;
        });

        OpenAccountRequest req = new OpenAccountRequest(1L, 1L, "Nominee", "SELF");
        AccountResponse res = accountService.openAccount(1L, req);
        assertThat(res.accountType).isEqualTo("Savings Account");
        assertThat(res.balance).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Close account: fails if balance > 0")
    void closeAccount_balanceNotZero_throws() {
        User user = mockUser(); Branch branch = mockBranch(); AccountType type = mockType();
        Account acc = Account.builder().id(5L).user(user).branch(branch).accountType(type)
            .balance(BigDecimal.valueOf(1000)).status(Account.AccountStatus.ACTIVE).build();
        when(accountRepo.findById(5L)).thenReturn(Optional.of(acc));
        assertThatThrownBy(() -> accountService.closeAccount(5L, 1L))
            .isInstanceOf(BankingException.class)
            .hasMessageContaining("withdraw all funds");
    }
}

// ============================================================
// Transaction Service Tests
// ============================================================
@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock private TransactionRepository txnRepo;
    @Mock private AccountRepository accountRepo;
    @Mock private NotificationService notifService;
    @InjectMocks private TransactionService txnService;

    private Account buildAccount(Long id, Long userId, BigDecimal balance) {
        User u = User.builder().id(userId).email("u@e.com").firstName("X").lastName("Y").build();
        Branch b = Branch.builder().id(1L).branchName("Main").ifscCode("BANK0001").build();
        AccountType t = AccountType.builder().id(1L).typeName("Savings").build();
        return Account.builder().id(id).user(u).branch(b).accountType(t)
            .accountNumber("ACC" + id).balance(balance).availableBalance(balance)
            .status(Account.AccountStatus.ACTIVE).build();
    }

    @Test
    @DisplayName("Deposit: increases balance correctly")
    void deposit_success() {
        Account acc = buildAccount(1L, 1L, BigDecimal.valueOf(10000));
        when(accountRepo.findById(1L)).thenReturn(Optional.of(acc));
        when(accountRepo.save(any())).thenReturn(acc);
        when(txnRepo.save(any())).thenAnswer(inv -> { Transaction t = inv.getArgument(0); t.setId(1L); return t; });
        doNothing().when(notifService).sendTransactionAlert(any(), any());

        DepositRequest req = new DepositRequest(1L, BigDecimal.valueOf(5000), "Test", "BRANCH");
        TransactionResponse res = txnService.deposit(req, 1L);
        assertThat(res.amount).isEqualByComparingTo(BigDecimal.valueOf(5000));
        assertThat(res.transactionType).isEqualTo("DEPOSIT");
    }

    @Test
    @DisplayName("Withdraw: insufficient balance throws")
    void withdraw_insufficientBalance_throws() {
        Account acc = buildAccount(1L, 1L, BigDecimal.valueOf(100));
        when(accountRepo.findById(1L)).thenReturn(Optional.of(acc));
        WithdrawalRequest req = new WithdrawalRequest(1L, BigDecimal.valueOf(5000), null, null);
        assertThatThrownBy(() -> txnService.withdraw(req, 1L))
            .isInstanceOf(BankingException.class).hasMessageContaining("Insufficient");
    }

    @Test
    @DisplayName("Transfer: same account throws")
    void transfer_sameAccount_throws() {
        Account acc = buildAccount(1L, 1L, BigDecimal.valueOf(50000));
        when(accountRepo.findById(1L)).thenReturn(Optional.of(acc));
        when(accountRepo.findByAccountNumber("ACC1")).thenReturn(Optional.of(acc));
        FundTransferRequest req = new FundTransferRequest(1L, "ACC1", BigDecimal.valueOf(100), null);
        assertThatThrownBy(() -> txnService.transfer(req, 1L))
            .isInstanceOf(BankingException.class).hasMessageContaining("same account");
    }

    @Test
    @DisplayName("Transfer: cross-account succeeds")
    void transfer_success() {
        Account from = buildAccount(1L, 1L, BigDecimal.valueOf(50000));
        Account to   = buildAccount(2L, 2L, BigDecimal.valueOf(10000));
        when(accountRepo.findById(1L)).thenReturn(Optional.of(from));
        when(accountRepo.findByAccountNumber("ACC2")).thenReturn(Optional.of(to));
        when(accountRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(txnRepo.save(any())).thenAnswer(inv -> { Transaction t = inv.getArgument(0); t.setId(99L); return t; });
        doNothing().when(notifService).sendTransactionAlert(any(), any());

        FundTransferRequest req = new FundTransferRequest(1L, "ACC2", BigDecimal.valueOf(1000), "Rent");
        TransactionResponse res = txnService.transfer(req, 1L);
        assertThat(res.status).isEqualTo("SUCCESS");
    }
}

// ============================================================
// Loan Calculator Tests
// ============================================================
@ExtendWith(MockitoExtension.class)
class LoanServiceTest {

    @Test
    @DisplayName("EMI calculation is mathematically correct")
    void emiCalculation_correct() {
        // P=200000, R=10.5%/year, N=24 months => EMI≈9298.47
        BigDecimal emi = LoanService.calculateEmi(
            BigDecimal.valueOf(200000), BigDecimal.valueOf(10.5), 24);
        assertThat(emi).isGreaterThan(BigDecimal.valueOf(9000))
            .isLessThan(BigDecimal.valueOf(9600));
    }

    @Test
    @DisplayName("EMI for 0 months throws ArithmeticException")
    void emiCalculation_zeroMonths_throws() {
        assertThatThrownBy(() ->
            LoanService.calculateEmi(BigDecimal.valueOf(100000), BigDecimal.valueOf(10), 0))
            .isInstanceOf(ArithmeticException.class);
    }
}
