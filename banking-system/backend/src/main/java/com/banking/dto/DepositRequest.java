package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class DepositRequest {
    @NotNull public Long accountId;
    @NotNull @DecimalMin("1.00") public BigDecimal amount;
    public String description;
    public String channel;
}
