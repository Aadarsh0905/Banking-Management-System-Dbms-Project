package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class LoanApplicationResponse {
    public Long id;
    public String applicationNo;
    public String loanType;
    public BigDecimal amountRequested;
    public Integer tenureMonths;
    public String status;
    public BigDecimal emiEstimate;
    public String purpose;
    public LocalDateTime submittedAt;
    public LocalDateTime createdAt;
}
