package com.banking.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardStats {
    public Long totalCustomers;
    public Long totalAccounts;
    public Long totalTransactionsToday;
    public BigDecimal totalTransactionValueToday;
    public Long pendingLoanApplications;
    public Long pendingKycVerifications;
    public Long activeLoans;
    public Long totalBranches;
}
