package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class FundTransferRequest {
    @NotNull public Long fromAccountId;
    @NotBlank public String toAccountNumber;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
    public String ifscCode;

    public FundTransferRequest(Long fromAccountId, String toAccountNumber, BigDecimal amount, String description) {
        this.fromAccountId = fromAccountId;
        this.toAccountNumber = toAccountNumber;
        this.amount = amount;
        this.description = description;
        this.ifscCode = null;
    }
}

