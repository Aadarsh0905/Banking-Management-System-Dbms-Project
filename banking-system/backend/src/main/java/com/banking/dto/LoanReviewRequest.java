package com.banking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoanReviewRequest {
    @NotNull public Long applicationId;
    @NotBlank public String decision;
    public String remarks;
}
