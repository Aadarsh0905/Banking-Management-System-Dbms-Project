package com.banking.service;

import com.banking.dto.AuthDTOs;
import com.banking.dto.UserResponse;
import com.banking.entity.Role;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.RoleRepository;
import com.banking.repository.UserRepository;
import com.banking.security.BankUserDetails;
import com.banking.security.BankUserDetailsService;
import com.banking.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class AuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
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
        User user = userRepo.findByPasswordResetToken(req.token)
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
