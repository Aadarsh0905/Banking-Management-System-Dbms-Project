package com.banking.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class EmiScheduleResponse {
    public Integer emiNumber;
    public LocalDate dueDate;
    public BigDecimal emiAmount;
    public BigDecimal principalComponent;
    public BigDecimal interestComponent;
    public BigDecimal outstandingAfter;
    public BigDecimal paidAmount;
    public String status;
    public LocalDateTime paidAt;
}
