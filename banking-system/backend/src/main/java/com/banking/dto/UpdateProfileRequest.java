package com.banking.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateProfileRequest {
    @Size(max=50) public String firstName;
    @Size(max=50) public String lastName;
    @Pattern(regexp="^[6-9]\\d{9}$") public String phone;
    public String gender;
}
