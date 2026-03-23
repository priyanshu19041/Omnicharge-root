package com.omnicharge.recharge.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "recharge_requests")
@Data
public class RechargeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private String mobileNumber;
    private Long operatorId;
    private Long planId;
    private BigDecimal amount;
    private String status; // PENDING, SUCCESS, FAILED
    private LocalDateTime requestDate;
    private String paymentTransactionId;
}
