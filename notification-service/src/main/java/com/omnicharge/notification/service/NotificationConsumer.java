package com.omnicharge.notification.service;

import com.omnicharge.notification.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationConsumer {

    public static final java.util.List<String> RECENT_NOTIFICATIONS = new java.util.ArrayList<>();

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumePaymentEvent(String message) {
        log.info("Received Message from RabbitMQ: {}", message);
        RECENT_NOTIFICATIONS.add(0, java.time.LocalDateTime.now() + " - " + message);
        if (RECENT_NOTIFICATIONS.size() > 50) RECENT_NOTIFICATIONS.remove(50);
        
        // Simulate sending an Email or SMS to the user
        log.info("Sending SMS/Email notification to the user for successful payment.");
    }
}
