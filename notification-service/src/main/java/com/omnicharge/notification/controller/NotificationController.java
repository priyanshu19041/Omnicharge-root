package com.omnicharge.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    // GET /api/v1/notifications/status — service health (existing)
    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> getNotificationStatus() {
        return ResponseEntity.ok(Map.of(
            "service", "notification-service",
            "status", "ACTIVE",
            "message", "Listening to RabbitMQ queue for background events."
        ));
    }

    // GET /api/v1/notifications/recent — latest notifications (existing, default all)
    @GetMapping("/recent")
    public List<String> getRecentNotifications() {
        return com.omnicharge.notification.service.NotificationConsumer.RECENT_NOTIFICATIONS;
    }

    // GET /api/v1/notifications/recent?limit=10 — latest N notifications (for frontend bell icon)
    @GetMapping("/recent/limit")
    public List<String> getRecentNotificationsWithLimit(@RequestParam(defaultValue = "10") int limit) {
        List<String> all = com.omnicharge.notification.service.NotificationConsumer.RECENT_NOTIFICATIONS;
        return all.size() <= limit ? all : all.subList(0, limit);
    }

    // GET /api/v1/notifications/count — total notification count (for badge display)
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getNotificationCount() {
        int count = com.omnicharge.notification.service.NotificationConsumer.RECENT_NOTIFICATIONS.size();
        return ResponseEntity.ok(Map.of("count", count));
    }
}

