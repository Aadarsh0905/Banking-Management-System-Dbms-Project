package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class BlockCardRequest {
    @NotNull public Long cardId;
    @NotBlank public String reason;
}
