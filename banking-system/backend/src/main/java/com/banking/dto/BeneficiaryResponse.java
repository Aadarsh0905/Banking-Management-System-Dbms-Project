package com.banking.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BeneficiaryResponse {
    public Long id;
    public String nickname;
    public String accountNumber;
    public String ifscCode;
    public String bankName;
    public String beneficiaryName;
}
