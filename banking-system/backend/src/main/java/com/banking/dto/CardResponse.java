package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CardResponse {
    public Long id;
    public String cardNumber;
    public String cardType;
    public String cardNetwork;
    public String cardHolderName;
    public Integer expiryMonth;
    public Integer expiryYear;
    public BigDecimal creditLimit;
    public BigDecimal outstandingBalance;
    public String status;
    public Boolean isOnlineEnabled;
    public Boolean isInternationalEnabled;
    public Boolean isContactlessEnabled;
    public LocalDateTime activatedAt;
}
