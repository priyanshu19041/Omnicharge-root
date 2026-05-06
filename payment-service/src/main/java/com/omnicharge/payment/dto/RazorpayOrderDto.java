package com.omnicharge.payment.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RazorpayOrderDto {
    private String razorpayOrderId;
    private Long internalTransactionId;
    private BigDecimal amount;
    private String keyId;
}
