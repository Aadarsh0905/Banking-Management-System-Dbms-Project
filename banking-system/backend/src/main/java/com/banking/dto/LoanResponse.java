package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoanResponse {
    public Long id;
    public String loanAccountNumber;
    public String loanType;
    public BigDecimal principalAmount;
    public BigDecimal interestRate;
    public Integer tenureMonths;
    public BigDecimal emiAmount;
    public BigDecimal outstandingBalance;
    public LocalDate disbursedAt;
    public LocalDate lastEmiDate;
    public String status;
    public Integer totalEmis;
    public Integer paidEmis;
    public Integer overdueEmis;
}
