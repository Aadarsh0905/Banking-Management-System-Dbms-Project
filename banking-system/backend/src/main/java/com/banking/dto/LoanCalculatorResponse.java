package com.banking.dto;

import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoanCalculatorResponse {
    public BigDecimal principal;
    public BigDecimal interestRate;
    public Integer tenureMonths;
    public BigDecimal emi;
    public BigDecimal totalAmount;
    public BigDecimal totalInterest;
    public BigDecimal processingFee;
}
