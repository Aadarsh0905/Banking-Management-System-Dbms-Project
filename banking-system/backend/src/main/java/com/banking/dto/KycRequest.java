package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class KycRequest {
    @NotBlank @Pattern(regexp="\\d{12}", message="Aadhaar must be 12 digits")
    public String aadhaarNumber;
    @NotBlank @Pattern(regexp="[A-Z]{5}[0-9]{4}[A-Z]", message="Invalid PAN format")
    public String panNumber;
    @NotBlank public String addressLine1;
    public String addressLine2;
    @NotBlank public String city;
    @NotBlank public String state;
    @NotBlank @Pattern(regexp="\\d{6}") public String pincode;
}
