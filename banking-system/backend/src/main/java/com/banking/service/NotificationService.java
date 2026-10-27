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

    @org.springframework.beans.factory.annotation.Value("${banking.mail.api-key:${MAIL_API_KEY:}}")
    private String mailApiKey;

    @org.springframework.beans.factory.annotation.Value("${banking.mail.api-provider:${MAIL_API_PROVIDER:brevo}}")
    private String mailApiProvider;

    private volatile String lastEmailStatus = "Not attempted";

    public String getLastEmailStatus() {
        return lastEmailStatus;
    }

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
            "<html lang='en'><head><meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<title>Your BankPortal Verification Code</title></head>" +
            "<body style='margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f1f5f9;padding:40px 16px;'>" +
            "<tr><td align='center'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width:540px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #e2e8f0;'>" +
            "<tr><td style='height:5px;background:linear-gradient(90deg,#ff6600,#ff8533);font-size:0;line-height:0;'>&nbsp;</td></tr>" +
            "<tr><td style='padding:28px 36px 20px 36px;border-bottom:1px solid #f1f5f9;'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0'>" +
            "<tr><td align='left' valign='middle'>" +
            "<span style='font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;'>🏦 BankPortal</span>" +
            "</td><td align='right' valign='middle'>" +
            "<span style='display:inline-block;font-size:11px;font-weight:700;color:#ea580c;background-color:#fff7ed;border:1px solid #ffedd5;padding:4px 12px;border-radius:9999px;text-transform:uppercase;letter-spacing:0.5px;'>Security Verification</span>" +
            "</td></tr></table></td></tr>" +
            "<tr><td style='padding:28px 36px 32px 36px;'>" +
            "<h1 style='margin:0 0 12px 0;font-size:20px;font-weight:700;color:#0f172a;line-height:1.3;'>Login Verification Code</h1>" +
            "<p style='margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#475569;'>Hello <strong style='color:#0f172a;'>" + firstName + "</strong>,</p>" +
            "<p style='margin:0 0 24px 0;font-size:14px;line-height:1.6;color:#475569;'>We received a sign-in request for your BankPortal account. Please enter the following 6-digit One-Time Password (OTP) to authenticate:</p>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='margin:0 0 24px 0;'>" +
            "<tr><td align='center' style='background-color:#0b1320;border-radius:12px;padding:24px 20px;border:1px solid #1e293b;'>" +
            "<div style='font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;'>6-Digit Security Code</div>" +
            "<div style='font-family:Consolas,Monaco,\"SF Mono\",Courier,monospace;font-size:38px;font-weight:800;color:#ff6600;letter-spacing:10px;padding-left:10px;line-height:1.2;'>" + otp + "</div>" +
            "<div style='font-size:11px;color:#64748b;margin-top:8px;'>Valid for <strong style='color:#cbd5e1;'>5 minutes</strong></div>" +
            "</td></tr></table>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin:0 0 24px 0;'>" +
            "<tr><td style='padding:16px 20px;'>" +
            "<table width='100%' border='0' cellspacing='0' cellpadding='0'>" +
            "<tr><td width='24' valign='top' style='font-size:16px;line-height:1.4;'>⏱️</td>" +
            "<td style='padding-left:8px;font-size:13px;line-height:1.5;color:#334155;'><strong>Single-Use:</strong> This code expires automatically in 5 minutes.</td></tr>" +
            "<tr><td colspan='2' style='height:8px;'></td></tr>" +
            "<tr><td width='24' valign='top' style='font-size:16px;line-height:1.4;'>🔒</td>" +
            "<td style='padding-left:8px;font-size:13px;line-height:1.5;color:#334155;'><strong>Confidential:</strong> BankPortal staff will never ask for your OTP or password.</td></tr>" +
            "</table></td></tr></table>" +
            "<p style='margin:0;font-size:12px;line-height:1.6;color:#64748b;border-top:1px solid #f1f5f9;padding-top:16px;'>" +
            "If you did not initiate this login request, please secure your account immediately or contact BankPortal Support." +
            "</p></td></tr>" +
            "<tr><td style='background-color:#f8fafc;padding:18px 36px;border-top:1px solid #e2e8f0;text-align:center;'>" +
            "<p style='margin:0 0 4px 0;font-size:11px;color:#64748b;font-weight:600;'>BankPortal Digital Banking &bull; 256-Bit SSL Encrypted</p>" +
            "<p style='margin:0;font-size:10px;color:#94a3b8;'>This is an automated system notification. Please do not reply directly to this email.</p>" +
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
        if (mailApiKey != null && !mailApiKey.trim().isBlank()) {
            System.out.println("Email: Using HTTPS API provider (" + mailApiProvider + ") to " + to);
            if (sendViaHttpApi(to, subject, htmlBody)) {
                lastEmailStatus = "Delivered via " + mailApiProvider + " HTTPS API to " + to;
                return true;
            }
            System.out.println("Email: HTTPS API failed, falling back to direct SMTP...");
        } else {
            lastEmailStatus = "MAIL_API_KEY is not configured or empty on server. Attempting direct SMTP...";
        }

        if (mailFrom == null || mailFrom.isBlank()) {
            lastEmailStatus = "SMTP sender address not configured.";
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
            lastEmailStatus = "Delivered via SMTP to " + to;
            return true;
        } catch (Exception e) {
            String errMsg = e.getMessage() != null ? e.getMessage() : e.toString();
            lastEmailStatus = (lastEmailStatus.contains("HTTP") ? lastEmailStatus + " | " : "") + "SMTP error: " + errMsg;
            System.err.println("\n=== EMAIL SENDING FAILED ===");
            System.err.println("Recipient: " + to);
            System.err.println("SMTP Username: " + mailFrom);
            System.err.println("Error: " + errMsg);
            System.err.println("============================\n");
            log.warn("Could not dispatch email to {}: {}. Login OTP is still logged in console/demo.", to, errMsg);
            return false;
        }
    }

    private boolean sendViaHttpApi(String to, String subject, String htmlBody) {
        if ("resend".equalsIgnoreCase(mailApiProvider)) {
            return sendViaResend(to, subject, htmlBody);
        } else {
            return sendViaBrevo(to, subject, htmlBody);
        }
    }

    private boolean sendViaBrevo(String to, String subject, String htmlBody) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("sender", java.util.Map.of("name", mailFromName, "email", mailFrom));
            body.put("to", java.util.List.of(java.util.Map.of("email", to)));
            body.put("subject", subject);
            body.put("htmlContent", htmlBody);

            String jsonPayload = mapper.writeValueAsString(body);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.brevo.com/v3/smtp/email"))
                .timeout(java.time.Duration.ofSeconds(15))
                .header("api-key", mailApiKey.trim())
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                lastEmailStatus = "Brevo HTTP " + response.statusCode() + " OK";
                log.info("Brevo HTTPS API: Email dispatched successfully to {}", to);
                System.out.println("Brevo HTTPS API: Email dispatched successfully to " + to);
                return true;
            } else {
                lastEmailStatus = "Brevo HTTP " + response.statusCode() + ": " + response.body();
                log.warn("Brevo HTTPS API returned HTTP {}: {}", response.statusCode(), response.body());
                System.err.println("Brevo HTTPS API error " + response.statusCode() + ": " + response.body());
                return false;
            }
        } catch (Exception e) {
            lastEmailStatus = "Brevo exception: " + e.getMessage();
            log.warn("Brevo HTTPS API failed to send email to {}: {}", to, e.getMessage());
            return false;
        }
    }

    private boolean sendViaResend(String to, String subject, String htmlBody) {
        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(10))
                .build();

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("from", mailFromName + " <" + mailFrom + ">");
            body.put("to", java.util.List.of(to));
            body.put("subject", subject);
            body.put("html", htmlBody);

            String jsonPayload = mapper.writeValueAsString(body);

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://api.resend.com/emails"))
                .timeout(java.time.Duration.ofSeconds(15))
                .header("Authorization", "Bearer " + mailApiKey.trim())
                .header("Content-Type", "application/json")
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

            java.net.http.HttpResponse<String> response = client.send(request, java.net.http.HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                lastEmailStatus = "Resend HTTP " + response.statusCode() + " OK";
                log.info("Resend HTTPS API: Email dispatched successfully to {}", to);
                System.out.println("Resend HTTPS API: Email dispatched successfully to " + to);
                return true;
            } else {
                lastEmailStatus = "Resend HTTP " + response.statusCode() + ": " + response.body();
                log.warn("Resend HTTPS API returned HTTP {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            lastEmailStatus = "Resend exception: " + e.getMessage();
            log.warn("Resend HTTPS API failed to send email to {}: {}", to, e.getMessage());
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
