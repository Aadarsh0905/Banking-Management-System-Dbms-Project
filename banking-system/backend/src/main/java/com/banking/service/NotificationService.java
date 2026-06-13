package com.banking.service;

import com.banking.dto.NotificationResponse;
import com.banking.entity.Notification;
import com.banking.entity.Transaction;
import com.banking.entity.User;
import com.banking.entity.LoanApplication;
import com.banking.repository.NotificationRepository;
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
public class NotificationService {
    private final NotificationRepository notifRepo;
    private final JavaMailSender mailSender;

    @Async
    public void sendWelcomeEmail(User user) {
        sendEmail(user.getEmail(),
            "Welcome to Banking Management System!",
            "<h2>Welcome, " + user.getFirstName() + "!</h2><p>Your account has been created successfully.</p>");
        saveInApp(user, "Welcome!", "Your account was created successfully.");
    }

    @Async
    public void sendTransactionAlert(User user, Transaction txn) {
        String msg = String.format("Transaction of ₹%.2f [%s] on your account. Ref: %s",
            txn.getAmount(), txn.getTransactionType(), txn.getTransactionRef());
        sendEmail(user.getEmail(), "Transaction Alert", "<p>" + msg + "</p>");
        saveInApp(user, "Transaction Alert", msg);
    }

    @Async
    public void sendPasswordResetEmail(User user, String token) {
        String link = "http://localhost:3000/reset-password?token=" + token;
        sendEmail(user.getEmail(), "Password Reset Request",
            "<p>Click <a href='" + link + "'>here</a> to reset your password. Link expires in 1 hour.</p>");
    }

    @Async
    public void sendLoanStatusEmail(LoanApplication app) {
        String status = app.getStatus().name();
        sendEmail(app.getUser().getEmail(), "Loan Application Update",
            "<p>Your loan application " + app.getApplicationNo() + " has been <strong>" + status + "</strong>.</p>");
        saveInApp(app.getUser(), "Loan Status Update", "Your loan application is now " + status);
    }

    private void sendEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
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
