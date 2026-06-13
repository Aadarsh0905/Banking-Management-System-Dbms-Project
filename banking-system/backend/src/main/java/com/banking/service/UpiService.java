package com.banking.service;

import com.banking.dto.CreateUpiRequest;
import com.banking.dto.FundTransferRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.UpiResponse;
import com.banking.dto.UpiTransferRequest;
import com.banking.entity.Account;
import com.banking.entity.UpiId;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UpiRepository;
import com.banking.repository.UserRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class UpiService {
    private final UpiRepository upiRepo;
    private final AccountRepository accountRepo;
    private final UserRepository userRepo;
    private final TransactionService txnService;
    private final TransactionRepository txnRepo;

    @Transactional
    public UpiResponse createUpiId(Long userId, CreateUpiRequest req) {
        if (upiRepo.existsByUpiId(req.upiId))
            throw new BankingException("UPI ID already taken", 409);
        Account acc = accountRepo.findById(req.accountId)
            .orElseThrow(() -> new BankingException("Account not found", 404));
        if (!acc.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        User u = userRepo.findById(userId).orElseThrow();

        boolean isFirst = upiRepo.findByUserIdAndIsActiveTrue(userId).isEmpty();
        UpiId upi = UpiId.builder()
            .user(u).account(acc).upiId(req.upiId)
            .isDefault(isFirst).isActive(true).build();
        upi = upiRepo.save(upi);
        return mapToResponse(upi);
    }

    public List<UpiResponse> getUserUpiIds(Long userId) {
        return upiRepo.findByUserIdAndIsActiveTrue(userId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public byte[] generateQrCode(String upiId, Long userId) {
        UpiId upi = upiRepo.findByUpiId(upiId)
            .orElseThrow(() -> new BankingException("UPI ID not found", 404));
        if (!upi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        try {
            String upiString = "upi://pay?pa=" + upiId + "&pn=" + upi.getUser().getFirstName();
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(upiString, BarcodeFormat.QR_CODE, 300, 300);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(matrix, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new BankingException("QR generation failed", 500);
        }
    }

    @Transactional
    public TransactionResponse sendMoney(Long userId, UpiTransferRequest req) {
        UpiId fromUpi = upiRepo.findByUpiId(req.fromUpiId)
            .orElseThrow(() -> new BankingException("Sender UPI ID not found", 404));
        UpiId toUpi = upiRepo.findByUpiId(req.toUpiId)
            .orElseThrow(() -> new BankingException("Receiver UPI ID not found", 404));
        if (!fromUpi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);

        FundTransferRequest transferReq = new FundTransferRequest(
            fromUpi.getAccount().getId(),
            toUpi.getAccount().getAccountNumber(),
            req.amount, req.description, null);
        return txnService.transfer(transferReq, userId);
    }

    public Map<String, Object> requestMoney(Long userId, Map<String, Object> req) {
        return Map.of(
            "requestId", UUID.randomUUID().toString(),
            "status", "PENDING",
            "message", "Payment request sent"
        );
    }

    public Page<TransactionResponse> getUpiHistory(Long userId, int page, int size) {
        return txnRepo.findUpiByUserId(userId, PageRequest.of(page, size))
            .map(txnService::mapToResponse);
    }

    @Transactional
    public void deleteUpiId(Long userId, Long upiId) {
        UpiId upi = upiRepo.findById(upiId)
            .orElseThrow(() -> new BankingException("UPI ID not found", 404));
        if (!upi.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        upi.setIsActive(false);
        upiRepo.save(upi);
    }

    private UpiResponse mapToResponse(UpiId u) {
        return UpiResponse.builder()
            .id(u.getId()).upiId(u.getUpiId()).qrCodeUrl(u.getQrCodeUrl())
            .isDefault(u.getIsDefault()).isActive(u.getIsActive())
            .linkedAccountNumber(u.getAccount().getAccountNumber())
            .build();
    }
}
