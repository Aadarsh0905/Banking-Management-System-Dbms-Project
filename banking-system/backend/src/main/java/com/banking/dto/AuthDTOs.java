package com.banking.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

public class AuthDTOs {
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank @Size(min=4,max=50)     public String username;
        @NotBlank @Email                   public String email;
        @NotBlank @Size(min=8,max=100)
        @Pattern(regexp="^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$",
                 message="Password must have upper, lower, digit and special character")
        public String password;
        @NotBlank @Size(min=2,max=50)     public String firstName;
        @NotBlank @Size(min=2,max=50)     public String lastName;
        @NotBlank @Pattern(regexp="^[6-9]\\d{9}$", message="Invalid Indian mobile number")
        public String phone;
        public LocalDate dateOfBirth;
        public String gender;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank public String usernameOrEmail;
        @NotBlank public String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        public String accessToken;
        public String refreshToken;
        @Builder.Default
        public String tokenType = "Bearer";
        public Long expiresIn;
        public UserResponse user;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ForgotPasswordRequest {
        @NotBlank @Email public String email;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class ResetPasswordRequest {
        @NotBlank public String token;
        @NotBlank @Size(min=8) public String newPassword;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RefreshTokenRequest {
        @NotBlank public String refreshToken;
    }
}
