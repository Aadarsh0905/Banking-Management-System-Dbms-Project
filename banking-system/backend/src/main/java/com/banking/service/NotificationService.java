package com.banking.service;

import com.banking.dto.NotificationResponse;
import com.banking.entity.Notification;
import com.banking.entity.Transaction;
import com.banking.entity.User;
import com.banking.entity.LoanApplication;
import com.banking.repository.NotificationRepository;
import com.banking.repository.UserRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service @RequiredArgsConstructor @Slf4j
@Transactional(readOnly = true)
public class NotificationService {
    private final NotificationRepository notifRepo;
    private final JavaMailSender mailSender;
    private final UserRepository userRepo;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String mailFrom;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.password:password}")
    private String mailPass;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.host}")
    private String mailHost;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.port}")
    private int mailPort;

    @org.springframework.beans.factory.annotation.Value("${banking.mail.from-name:Banking Management System}")
    private String mailFromName;

    @org.springframework.beans.factory.annotation.Value("${banking.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(User user) {
        sendEmail(user.getEmail(),
            "Welcome to Banking Management System!",
            "<h2>Welcome, " + user.getFirstName() + "!</h2><p>Your account has been created successfully.</p>");
        saveInApp(user, "Welcome!", "Your account was created successfully.");
    }

    @Async
    @Transactional
    public void sendActivityNotification(User user, String title, String message) {
        if (user != null) {
            sendEmail(user.getEmail(), title, "<p>" + message + "</p>");
            saveInApp(user, title, message);
        }
    }

    @Async
    @Transactional
    public void sendActivityNotification(Long userId, String title, String message) {
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
            sendEmail(user.getEmail(), title, "<p>" + message + "</p>");
            saveInApp(user, title, message);
        }
    }

    @Async
    public void sendTransactionAlert(User user, Transaction txn) {
        boolean isReceiver = txn.getToAccount() != null && txn.getToAccount().getUser().getId().equals(user.getId());
        String title;
        String msg;
        
        if (isReceiver) {
            title = "💸 Money Received";
            String senderName = txn.getFromAccount() != null 
                ? txn.getFromAccount().getUser().getFirstName() + " " + txn.getFromAccount().getUser().getLastName()
                : "External Source";
            msg = String.format("You received ₹%,.2f from %s. Ref: %s",
                txn.getAmount(), senderName, txn.getTransactionRef());
        } else {
            title = "✅ Transaction Successful";
            msg = String.format("Your transaction of ₹%,.2f [%s] was successful. Ref: %s",
                txn.getAmount(), txn.getTransactionType().name(), txn.getTransactionRef());
        }
        
        sendEmail(user.getEmail(), title, "<p>" + msg + "</p>");
        saveInApp(user, title, msg);
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        System.out.println("========================================= [FORGOT PASSWORD] =========================================");
        System.out.println("User '" + user.getEmail() + "' requested a password reset.");
        System.out.println("Reset Token: " + token);
        System.out.println("Reset Link: " + link);
        System.out.println("======================================================================================================");
        log.info("========================================= [FORGOT PASSWORD] =========================================");
        log.info("User '{}' requested a password reset.", user.getEmail());
        log.info("Reset Token: {}", token);
        log.info("Reset Link: {}", link);
        log.info("======================================================================================================");
        sendEmail(user.getEmail(), "Password Reset Request",
            "<p>Click <a href='" + link + "'>here</a> to reset your password. Link expires in 1 hour.</p>");
    }

    @Async
    public void sendPasswordResetOtp(User user, String otp) {
        System.out.println("\n========================================= [FORGOT PASSWORD OTP] =========================================");
        System.out.println("User '" + user.getEmail() + "' requested a password reset OTP.");
        System.out.println("OTP: " + otp);
        System.out.println("=========================================================================================================\n");
        log.info("========================================= [FORGOT PASSWORD OTP] =========================================");
        log.info("User '{}' requested a password reset OTP.", user.getEmail());
        log.info("OTP: {}", otp);
        log.info("=========================================================================================================");
    }

    public boolean sendOtpEmail(User user, String otp) {
        String recipient = user.getEmail();
        String firstName = (user.getFirstName() != null && !user.getFirstName().isBlank()) ? user.getFirstName() : user.getUsername();

        System.out.println("\n========================================= [LOGIN OTP DISPATCH] =========================================");
        System.out.println("Recipient Email: " + recipient);
        System.out.println("Username:        " + user.getUsername());
        System.out.println("Generated OTP:   " + otp + " (Demo master OTP fallback: 123456)");
        System.out.println("=========================================================================================================\n");
        log.info("========================================= [LOGIN OTP DISPATCH] =========================================");
        log.info("Recipient Email: {}", recipient);
        log.info("Username:        {}", user.getUsername());
        log.info("Generated OTP:   {} (Demo master OTP fallback: 123456)", otp);
        log.info("=========================================================================================================");

        String subject = "Your BankPortal Login OTP: " + otp;
        String htmlBody = "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'></head>" +
            "<body style='margin:0;padding:24px;background-color:#0b1320;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;color:#e2e8f0;'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0'>" +
            "<tr><td align='center'>" +
            "<table width='100%' style='max-width:540px;background-color:#0f1d32;border:1px solid #1e3a5f;border-radius:16px;padding:32px;box-shadow:0 10px 25px rgba(0,0,0,0.5);'>" +
            "<tr><td>" +
            "<div style='margin-bottom:24px;'>" +
            "<span style='background:#ff6600;color:#ffffff;font-size:18px;font-weight:bold;padding:6px 12px;border-radius:8px;margin-right:10px;'>🏦 BankPortal</span>" +
            "<span style='font-size:12px;color:#38bdf8;font-weight:700;text-transform:uppercase;letter-spacing:1px;'>Security Verification</span>" +
            "</div>" +
            "<h2 style='color:#ffffff;margin-top:0;font-size:22px;font-weight:700;'>Login Verification Code</h2>" +
            "<p style='color:#94a3b8;font-size:14px;line-height:1.6;'>Hello <strong>" + firstName + "</strong>,</p>" +
            "<p style='color:#94a3b8;font-size:14px;line-height:1.6;'>You requested to sign in to your BankPortal account. Please use the following One-Time Password (OTP) to complete your verification:</p>" +
            "<div style='text-align:center;margin:28px 0;'>" +
            "<div style='display:inline-block;padding:16px 36px;background:#060e18;border:2px dashed #ff6600;border-radius:12px;font-size:36px;font-weight:bold;color:#ff6600;letter-spacing:8px;font-family:monospace;'>" + otp + "</div>" +
            "</div>" +
            "<div style='color:#cbd5e1;font-size:13px;line-height:1.6;background:#060e18;padding:14px 18px;border-radius:10px;border-left:4px solid #ff6600;margin-bottom:20px;'>" +
            "⏱️ <strong>This OTP is valid for 5 minutes.</strong><br/>" +
            "🔒 Never share this code or your banking password with anyone, including bank representatives." +
            "</div>" +
            "<p style='color:#64748b;font-size:12px;border-top:1px solid #1e3a5f;padding-top:16px;margin-top:20px;'>" +
            "If you did not request this OTP, please contact BankPortal Security immediately." +
            "</p>" +
            "</td></tr></table>" +
            "</td></tr></table>" +
            "</body></html>";

        return sendEmail(recipient, subject, htmlBody);
    }

    @Async
    @Transactional
    public void sendLoanStatusEmail(Long userId, String email, String appNo, String status) {
        sendEmail(email, "Loan Application Update",
            "<p>Your loan application " + appNo + " has been <strong>" + status + "</strong>.</p>");
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
            saveInApp(user, "Loan Status Update", "Your loan application " + appNo + " is now " + status);
        }
    }

    private boolean sendEmail(String to, String subject, String htmlBody) {
        if (mailFrom == null || mailFrom.isBlank()) {
            System.out.println("SMTP: Sender address not configured. Skipping external email dispatch.");
            return false;
        }

        System.out.println("SMTP: Sending email to " + to + " via " + mailHost + ":" + mailPort + " using " + mailFrom);
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            System.out.println("SMTP: Email successfully dispatched to " + to);
            log.info("SMTP: Email successfully dispatched to {}", to);
            return true;
        } catch (Exception e) {
            System.err.println("\n=== EMAIL SENDING FAILED ===");
            System.err.println("Recipient: " + to);
            System.err.println("SMTP Username: " + mailFrom);
            System.err.println("Error: " + e.getMessage());
            System.err.println("============================\n");
            log.warn("Could not dispatch email to {}: {}. Login OTP is still logged in console/demo.", to, e.getMessage());
            return false;
        }
    }

    private void saveInApp(User user, String title, String message) {
        notifRepo.save(Notification.builder()
            .user(user).title(title).message(message)
            .channel(Notification.NotificationChannel.IN_APP)
            .status(Notification.NotificationStatus.SENT)
            .sentAt(LocalDateTime.now())
            .build());
    }

    public Page<NotificationResponse> getNotifications(Long userId, int page, int size) {
        return notifRepo.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
            .map(n -> NotificationResponse.builder()
                .id(n.getId()).title(n.getTitle()).message(n.getMessage())
                .channel(n.getChannel().name()).status(n.getStatus().name())
                .createdAt(n.getCreatedAt()).readAt(n.getReadAt()).build());
    }

    public long getUnreadCount(Long userId) {
        return notifRepo.countByUserIdAndStatus(userId, Notification.NotificationStatus.SENT);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notifRepo.findPendingByUser(userId).forEach(n -> {
            n.setStatus(Notification.NotificationStatus.READ);
            n.setReadAt(LocalDateTime.now());
            notifRepo.save(n);
        });
    }
}
