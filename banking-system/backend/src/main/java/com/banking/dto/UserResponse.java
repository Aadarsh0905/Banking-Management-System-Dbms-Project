package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    public Long id;
    public String username;
    public String email;
    public String firstName;
    public String lastName;
    public String phone;
    public String dateOfBirth;
    public String gender;
    public String profilePictureUrl;
    public Boolean isActive;
    public Boolean isLocked;
    public Boolean emailVerified;
    public List<String> roles;
    public String kycStatus;
    public LocalDateTime lastLoginAt;
    public LocalDateTime createdAt;
}
