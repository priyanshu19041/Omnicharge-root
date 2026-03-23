package com.omnicharge.recharge.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentTransactionDto {
    private Long userId;
    private Long rechargePlanId;
    private BigDecimal amount;
    private String status;
    private String transactionId;
}
