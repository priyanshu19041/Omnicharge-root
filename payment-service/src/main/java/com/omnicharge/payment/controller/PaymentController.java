package com.omnicharge.payment.controller;

import com.omnicharge.payment.entity.PaymentTransaction;
import com.omnicharge.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    
    @PostMapping
    public PaymentTransaction makePayment(@RequestBody PaymentTransaction transaction) {
        return paymentService.processPayment(transaction);
    }
}
