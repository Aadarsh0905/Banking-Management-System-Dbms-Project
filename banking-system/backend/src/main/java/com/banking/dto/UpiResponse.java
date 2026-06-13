package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UpiResponse {
    public Long id;
    public String upiId;
    public String qrCodeUrl;
    public Boolean isDefault;
    public Boolean isActive;
    public String linkedAccountNumber;
}
