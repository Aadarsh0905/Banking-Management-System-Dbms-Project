package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CardRequest {
    @NotNull public Long accountId;
    @NotBlank public String cardType;
    public String cardNetwork;
}
