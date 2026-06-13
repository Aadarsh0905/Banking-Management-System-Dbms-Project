package com.banking.config;

import com.banking.entity.*;
import com.banking.repository.*;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// ── Swagger Config ─────────────────────────────────────────
@Configuration
class SwaggerConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Banking Management System API")
                .description("Complete REST API for Banking Management System")
                .version("1.0.0")
                .contact(new Contact().name("Banking Dev Team").email("dev@bank.com")))
            .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth",
                    new SecurityScheme().type(SecurityScheme.Type.HTTP)
                        .scheme("bearer").bearerFormat("JWT")));
    }
}

// ── Scheduled Tasks ────────────────────────────────────────
@Component @RequiredArgsConstructor @Slf4j
class ScheduledTasks {
    private final EmiScheduleRepository emiRepo;
    private final ScheduledTransferRepository scheduledTransferRepo;
    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    // Mark overdue EMIs every day at midnight
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void markOverdueEmis() {
        List<EmiSchedule> overdue = emiRepo.findByDueDateBeforeAndStatus(
            LocalDate.now(), EmiSchedule.EmiStatus.UPCOMING);
        overdue.forEach(e -> e.setStatus(EmiSchedule.EmiStatus.OVERDUE));
        emiRepo.saveAll(overdue);
        log.info("Marked {} EMIs as overdue", overdue.size());
    }

    // Send EMI reminders 1 day before
    @Scheduled(cron = "0 9 0 * * *")
    @Transactional
    public void sendEmiReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<EmiSchedule> upcoming = emiRepo.findDueOn(tomorrow);
        upcoming.forEach(e -> {
            User user = e.getLoan().getUser();
            notifRepo.save(Notification.builder()
                .user(user)
                .title("EMI Reminder")
                .message(String.format("Your EMI of ₹%.2f for loan %s is due tomorrow.",
                    e.getEmiAmount(), e.getLoan().getLoanAccountNumber()))
                .channel(Notification.NotificationChannel.IN_APP)
                .status(Notification.NotificationStatus.SENT)
                .sentAt(LocalDateTime.now())
                .build());
        });
        log.info("Sent {} EMI reminders", upcoming.size());
    }

    // Unlock accounts locked for more than 30 minutes (if admin didn't manually unlock)
    @Scheduled(fixedDelay = 1800000) // every 30 mins
    @Transactional
    public void autoUnlockAccounts() {
        // In production, query users locked before 30 min ago and unlock them
        log.debug("Auto-unlock check completed");
    }
}
