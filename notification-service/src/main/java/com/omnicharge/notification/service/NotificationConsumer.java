package com.omnicharge.notification.service;

import com.omnicharge.notification.config.RabbitMQConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NotificationConsumer {

    public static final java.util.List<String> RECENT_NOTIFICATIONS = new java.util.ArrayList<>();

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void consumePaymentEvent(String message) {
        log.info("Received Message from RabbitMQ: {}", message);
        
        try {
            JsonNode event = objectMapper.readTree(message);
            String status = event.has("status") ? event.get("status").asText() : "UNKNOWN";
            Long userId = event.has("userId") ? event.get("userId").asLong() : null;
            Long planId = event.has("planId") ? event.get("planId").asLong() : null;
            Double amount = event.has("amount") ? event.get("amount").asDouble() : null;

            String logMessage = "Payment " + status + " for Plan ID: " + planId + " Amount: " + amount;
            RECENT_NOTIFICATIONS.add(0, java.time.LocalDateTime.now() + " - " + logMessage);
            if (RECENT_NOTIFICATIONS.size() > 50) RECENT_NOTIFICATIONS.remove(50);

            if (userId != null) {
                // Fetch User Details from User Service
                String url = "http://user-service/api/v1/users/" + userId;
                JsonNode userNode = restTemplate.getForObject(url, JsonNode.class);
                
                if (userNode != null && userNode.has("email")) {
                    String email = userNode.get("email").asText();
                    String username = userNode.has("username") ? userNode.get("username").asText() : "User";
                    
                    sendEmailNotification(email, username, status, planId, amount);
                } else {
                    log.warn("User or email not found for userId: {}", userId);
                }
            }

        } catch (Exception e) {
            log.error("Error processing notification message", e);
            // Fallback for older string messages
            RECENT_NOTIFICATIONS.add(0, java.time.LocalDateTime.now() + " - " + message);
        }
    }

    private void sendEmailNotification(String to, String username, String status, Long planId, Double amount) {
        try {
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(to);
            mailMessage.setFrom("noreply@omnicharge.com");
            
            if ("SUCCESS".equalsIgnoreCase(status)) {
                mailMessage.setSubject("Omnicharge: Payment Successful");
                mailMessage.setText("Hello " + username + ",\n\nYour payment of ₹" + amount + " for Plan ID " + planId + " was successful. Your recharge will be activated shortly.\n\nThank you for using Omnicharge!");
            } else {
                mailMessage.setSubject("Omnicharge: Payment Failed");
                mailMessage.setText("Hello " + username + ",\n\nYour payment of ₹" + amount + " for Plan ID " + planId + " has failed. Please try again or contact support if money was deducted.\n\nThank you,\nOmnicharge Team");
            }

            mailSender.send(mailMessage);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}", to, e);
        }
    }
}
