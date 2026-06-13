package com.banking.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoanApplicationRequest {
    @NotNull public Long loanTypeId;
    @NotNull public Long accountId;
    @NotNull @DecimalMin("1000") public BigDecimal amountRequested;
    @NotNull @Min(3) public Integer tenureMonths;
    public String purpose;
    @NotNull @DecimalMin("10000") public BigDecimal annualIncome;
    @NotBlank public String employmentType;
    public String employerName;
}
