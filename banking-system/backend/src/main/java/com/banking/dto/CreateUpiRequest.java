package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class CreateUpiRequest {
    @NotNull public Long accountId;
    @NotBlank @Pattern(regexp="[a-zA-Z0-9.\\-_]+@[a-zA-Z]+", message="Invalid UPI ID format")
    public String upiId;
}
