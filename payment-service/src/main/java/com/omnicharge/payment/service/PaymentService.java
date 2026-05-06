package com.omnicharge.payment.service;

import com.omnicharge.payment.entity.PaymentTransaction;
import com.omnicharge.payment.repository.PaymentRepository;
import com.omnicharge.payment.config.RabbitMQConfig;
import com.omnicharge.payment.dto.RazorpayOrderDto;
import com.omnicharge.payment.dto.RazorpayCallback;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final PaymentRepository repository;
    private final RabbitTemplate rabbitTemplate;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public RazorpayOrderDto createOrder(PaymentTransaction payment) {
        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            // Razorpay expects amount in paise (multiply by 100)
            int amountInPaise = payment.getAmount().multiply(new BigDecimal("100")).intValue();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

            Order order = razorpay.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            payment.setStatus("PENDING");
            payment.setTransactionId(UUID.randomUUID().toString());
            payment.setTimestamp(LocalDateTime.now());
            payment.setRazorpayOrderId(razorpayOrderId);
            
            PaymentTransaction saved = repository.save(payment);

            RazorpayOrderDto dto = new RazorpayOrderDto();
            dto.setRazorpayOrderId(razorpayOrderId);
            dto.setInternalTransactionId(saved.getId());
            dto.setAmount(saved.getAmount());
            dto.setKeyId(razorpayKeyId);

            return dto;
        } catch (Exception e) {
            log.error("Failed to create Razorpay Order", e);
            throw new RuntimeException("Payment initiation failed");
        }
    }

    public PaymentTransaction verifyAndCompletePayment(RazorpayCallback callback) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", callback.getRazorpayOrderId());
            options.put("razorpay_payment_id", callback.getRazorpayPaymentId());
            options.put("razorpay_signature", callback.getRazorpaySignature());

            boolean isValid = Utils.verifyPaymentSignature(options, razorpayKeySecret);

            if (!isValid) {
                PaymentTransaction transaction = repository.findAll().stream()
                        .filter(t -> callback.getRazorpayOrderId().equals(t.getRazorpayOrderId()))
                        .findFirst()
                        .orElse(null);

                if (transaction != null) {
                    transaction.setStatus("FAILED");
                    repository.save(transaction);
                    
                    JSONObject event = new JSONObject();
                    event.put("status", "FAILED");
                    event.put("userId", transaction.getUserId());
                    event.put("planId", transaction.getRechargePlanId());
                    event.put("amount", transaction.getAmount());
                    rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event.toString());
                }

                throw new RuntimeException("Invalid Payment Signature");
            }

            PaymentTransaction transaction = repository.findAll().stream()
                    .filter(t -> callback.getRazorpayOrderId().equals(t.getRazorpayOrderId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Transaction not found"));

            transaction.setStatus("SUCCESS");
            transaction.setRazorpayPaymentId(callback.getRazorpayPaymentId());
            PaymentTransaction saved = repository.save(transaction);

            JSONObject event = new JSONObject();
            event.put("status", "SUCCESS");
            event.put("userId", saved.getUserId());
            event.put("planId", saved.getRechargePlanId());
            event.put("amount", saved.getAmount());
            
            // Publish event to RabbitMQ → consumed by notification-service
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event.toString());

            return saved;
        } catch (Exception e) {
            log.error("Failed to verify Razorpay Signature", e);
            throw new RuntimeException("Payment verification failed");
        }
    }

    // Existing fallback mock
    public PaymentTransaction processPayment(PaymentTransaction payment) {
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setTimestamp(LocalDateTime.now());
        PaymentTransaction saved = repository.save(payment);
        
        JSONObject event = new JSONObject();
        event.put("status", "SUCCESS");
        event.put("userId", saved.getUserId());
        event.put("planId", saved.getRechargePlanId());
        event.put("amount", saved.getAmount());
        
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, event.toString());
        return saved;
    }

    public List<PaymentTransaction> getPaymentsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public PaymentTransaction getPaymentById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }
}
