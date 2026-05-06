package com.omnicharge.payment.dto;

import lombok.Data;

@Data
public class RazorpayOrderResponse {
    private String secretKeyId;
    private String razorpayOrderId;
    private String applicationFee;
    private String secretName;
    private Long id;
}
