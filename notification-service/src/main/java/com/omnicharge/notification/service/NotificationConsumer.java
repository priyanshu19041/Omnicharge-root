package com.omnicharge.notification.service;

import com.omnicharge.notification.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationConsumer {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumePaymentEvent(String message) {
        log.info("Received Message from RabbitMQ: {}", message);
        // Simulate sending an Email or SMS to the user
        log.info("Sending SMS/Email notification to the user for successful payment.");
    }
}
