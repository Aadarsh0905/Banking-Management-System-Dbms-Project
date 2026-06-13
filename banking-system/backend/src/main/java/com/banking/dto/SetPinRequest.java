package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class SetPinRequest {
    @NotNull public Long cardId;
    @NotBlank @Pattern(regexp="\\d{4}", message="PIN must be 4 digits") public String pin;
    @NotBlank public String cvv;
}
