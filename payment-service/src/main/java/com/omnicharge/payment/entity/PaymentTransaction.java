package com.omnicharge.payment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private Long rechargePlanId;
    private BigDecimal amount;
    private String status; // SUCCESS, FAILED
    private String transactionId;
    private LocalDateTime timestamp;
    
    private String razorpayOrderId;
    private String razorpayPaymentId;
}
