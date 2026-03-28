package com.omnicharge.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getNotificationStatus() {
        return ResponseEntity.ok(Map.of(
            "service", "notification-service",
            "status", "ACTIVE",
            "message", "Listening to RabbitMQ queue for background events."
        ));
    }
    
    @GetMapping("/recent")
    public java.util.List<String> getRecentNotifications() {
        return com.omnicharge.notification.service.NotificationConsumer.RECENT_NOTIFICATIONS;
    }
}
