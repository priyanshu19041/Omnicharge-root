package com.omnicharge.payment.service;

import com.omnicharge.payment.entity.PaymentTransaction;
import com.omnicharge.payment.repository.PaymentRepository;
import com.omnicharge.payment.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository repository;
    private final RabbitTemplate rabbitTemplate;

    public PaymentTransaction processPayment(PaymentTransaction payment) {
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setTimestamp(LocalDateTime.now());
        
        PaymentTransaction saved = repository.save(payment);
        
        // Publish event
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, 
            "Payment successful for Plan ID: " + saved.getRechargePlanId() + " Amount: " + saved.getAmount());
            
        return saved;
    }

    public java.util.List<PaymentTransaction> getPaymentsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }
}
