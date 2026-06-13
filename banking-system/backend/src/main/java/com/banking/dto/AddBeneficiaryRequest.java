package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class AddBeneficiaryRequest {
    @NotBlank @Size(max=50) public String nickname;
    @NotBlank @Size(min=10,max=20) public String accountNumber;
    @NotBlank @Size(min=11,max=15) public String ifscCode;
    public String bankName;
    @NotBlank @Size(max=100) public String beneficiaryName;
}
