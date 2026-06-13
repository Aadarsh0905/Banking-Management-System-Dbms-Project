package com.banking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class OpenAccountRequest {
    @NotNull public Long accountTypeId;
    @NotNull public Long branchId;
    public String nomineeName;
    public String nomineeRelation;
}
