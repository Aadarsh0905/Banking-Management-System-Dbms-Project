package com.banking.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NotificationResponse {
    public Long id;
    public String title;
    public String message;
    public String channel;
    public String status;
    public LocalDateTime createdAt;
    public LocalDateTime readAt;
}
