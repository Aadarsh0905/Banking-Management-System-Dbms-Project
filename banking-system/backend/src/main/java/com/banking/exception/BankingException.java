package com.banking.exception;

import lombok.Getter;

@Getter
public class BankingException extends RuntimeException {
    private final int statusCode;
    public BankingException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}
