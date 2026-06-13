package com.banking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data @NoArgsConstructor @AllArgsConstructor
public class StatementRequest {
    @NotNull public Long accountId;
    @NotNull public LocalDate fromDate;
    @NotNull public LocalDate toDate;
}
