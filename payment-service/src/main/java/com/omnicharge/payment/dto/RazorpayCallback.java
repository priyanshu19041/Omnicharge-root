package com.omnicharge.payment.dto;

import lombok.Data;

@Data
public class RazorpayCallback {
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;
}
