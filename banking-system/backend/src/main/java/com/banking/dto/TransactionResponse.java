package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TransactionResponse {
    public Long id;
    public String transactionRef;
    public String transactionType;
    public BigDecimal amount;
    public String currency;
    public String status;
    public String channel;
    public String description;
    public String fromAccount;
    public String toAccount;
    public BigDecimal balanceBefore;
    public BigDecimal balanceAfter;
    public LocalDateTime initiatedAt;
    public LocalDateTime completedAt;
}
