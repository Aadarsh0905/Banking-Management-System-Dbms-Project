package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpiTransferRequest {
    @NotBlank public String fromUpiId;
    @NotBlank public String toUpiId;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
}
