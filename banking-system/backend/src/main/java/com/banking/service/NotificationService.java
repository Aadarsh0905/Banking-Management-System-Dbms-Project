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

    @org.springframework.beans.factory.annotation.Value("${banking.mail.from-name:Banking Management System}")
    private String mailFromName;

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
        String link = "http://localhost:3000/reset-password?token=" + token;
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
    @Transactional
    public void sendLoanStatusEmail(Long userId, String email, String appNo, String status) {
        sendEmail(email, "Loan Application Update",
            "<p>Your loan application " + appNo + " has been <strong>" + status + "</strong>.</p>");
        User user = userRepo.findById(userId).orElse(null);
        if (user != null) {
            saveInApp(user, "Loan Status Update", "Your loan application " + appNo + " is now " + status);
        }
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            if (mailFrom != null && !mailFrom.isBlank()) {
                if (mailFrom.contains("@")) {
                    helper.setFrom(mailFrom, mailFromName);
                } else {
                    helper.setFrom("noreply@banking.com", mailFromName);
                }
            }
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
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
