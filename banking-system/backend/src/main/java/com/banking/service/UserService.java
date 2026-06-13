package com.banking.service;

import com.banking.dto.AddBeneficiaryRequest;
import com.banking.dto.BeneficiaryResponse;
import com.banking.dto.KycRequest;
import com.banking.dto.UpdateProfileRequest;
import com.banking.dto.UserResponse;
import com.banking.entity.Beneficiary;
import com.banking.entity.KycDetails;
import com.banking.entity.User;
import com.banking.exception.BankingException;
import com.banking.repository.BeneficiaryRepository;
import com.banking.repository.KycRepository;
import com.banking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Slf4j
public class UserService {
    private final UserRepository userRepo;
    private final KycRepository kycRepo;
    private final BeneficiaryRepository benefRepo;
    private final AuthService authService;

    @Value("${banking.upload.dir:./uploads}")
    private String uploadDir;

    public UserResponse getProfile(Long userId) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        UserResponse r = authService.mapToUserResponse(u);
        kycRepo.findByUserId(userId).ifPresent(k -> r.setKycStatus(k.getKycStatus().name()));
        return r;
    }

    @Transactional
    public UserResponse updateProfile(Long userId, UpdateProfileRequest req) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        if (req.firstName != null) u.setFirstName(req.firstName);
        if (req.lastName  != null) u.setLastName(req.lastName);
        if (req.phone     != null) u.setPhone(req.phone);
        if (req.gender    != null) u.setGender(User.Gender.valueOf(req.gender));
        return authService.mapToUserResponse(userRepo.save(u));
    }

    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir, "avatars");
            Files.createDirectories(dir);
            String filename = userId + "_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            String url = "/uploads/avatars/" + filename;
            User u = userRepo.findById(userId).orElseThrow();
            u.setProfilePictureUrl(url);
            userRepo.save(u);
            return url;
        } catch (IOException e) {
            throw new BankingException("Failed to upload file", 500);
        }
    }

    @Transactional
    public void submitKyc(Long userId, KycRequest req) {
        User u = userRepo.findById(userId).orElseThrow(() -> new BankingException("User not found", 404));
        KycDetails kyc = kycRepo.findByUserId(userId).orElse(KycDetails.builder().user(u).build());
        kyc.setAadhaarNumber(req.aadhaarNumber);
        kyc.setPanNumber(req.panNumber);
        kyc.setAddressLine1(req.addressLine1);
        kyc.setAddressLine2(req.addressLine2);
        kyc.setCity(req.city);
        kyc.setState(req.state);
        kyc.setPincode(req.pincode);
        kyc.setKycStatus(KycDetails.KycStatus.SUBMITTED);
        kycRepo.save(kyc);
    }

    public Map<String, Object> getKycStatus(Long userId) {
        return kycRepo.findByUserId(userId).map(k -> Map.<String,Object>of(
            "status", k.getKycStatus().name(),
            "city", k.getCity(),
            "state", k.getState(),
            "verifiedAt", k.getVerifiedAt() != null ? k.getVerifiedAt().toString() : null
        )).orElse(Map.of("status", "NOT_SUBMITTED"));
    }

    public List<BeneficiaryResponse> getBeneficiaries(Long userId) {
        return benefRepo.findByUserIdAndIsActiveTrue(userId).stream().map(b ->
            BeneficiaryResponse.builder()
                .id(b.getId()).nickname(b.getNickname())
                .accountNumber(b.getAccountNumber()).ifscCode(b.getIfscCode())
                .bankName(b.getBankName()).beneficiaryName(b.getBeneficiaryName())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(Long userId, AddBeneficiaryRequest req) {
        if (benefRepo.existsByUserIdAndAccountNumber(userId, req.accountNumber))
            throw new BankingException("Beneficiary already exists", 409);
        User u = userRepo.findById(userId).orElseThrow();
        Beneficiary b = Beneficiary.builder()
            .user(u).nickname(req.nickname).accountNumber(req.accountNumber)
            .ifscCode(req.ifscCode).bankName(req.bankName).beneficiaryName(req.beneficiaryName)
            .isActive(true).build();
        b = benefRepo.save(b);
        return BeneficiaryResponse.builder()
            .id(b.getId()).nickname(b.getNickname()).accountNumber(b.getAccountNumber())
            .ifscCode(b.getIfscCode()).bankName(b.getBankName()).beneficiaryName(b.getBeneficiaryName())
            .build();
    }

    @Transactional
    public void removeBeneficiary(Long userId, Long benefId) {
        Beneficiary b = benefRepo.findById(benefId).orElseThrow(() -> new BankingException("Beneficiary not found", 404));
        if (!b.getUser().getId().equals(userId)) throw new BankingException("Unauthorized", 403);
        b.setIsActive(false);
        benefRepo.save(b);
    }
}
