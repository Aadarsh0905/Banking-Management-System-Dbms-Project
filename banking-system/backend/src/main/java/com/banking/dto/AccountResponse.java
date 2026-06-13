package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AccountResponse {
    public Long id;
    public String accountNumber;
    public String accountType;
    public BigDecimal balance;
    public BigDecimal availableBalance;
    public String currency;
    public String status;
    public String branchName;
    public String ifscCode;
    public LocalDate openedAt;
    public LocalDateTime lastTransactionAt;
    public String nomineeName;
}
