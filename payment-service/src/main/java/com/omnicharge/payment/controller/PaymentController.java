package com.omnicharge.payment.controller;

import com.omnicharge.payment.entity.PaymentTransaction;
import com.omnicharge.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    // POST /api/v1/payments/create-order — Razorpay integration
    @PostMapping("/create-order")
    public com.omnicharge.payment.dto.RazorpayOrderDto createOrder(@RequestBody PaymentTransaction transaction) {
        return paymentService.createOrder(transaction);
    }

    // POST /api/v1/payments/verify — Razorpay callback verification
    @PostMapping("/verify")
    public PaymentTransaction verifyPayment(@RequestBody com.omnicharge.payment.dto.RazorpayCallback callback) {
        return paymentService.verifyAndCompletePayment(callback);
    }

    // Fallback Mock Payment
    @PostMapping
    public PaymentTransaction makePayment(@RequestBody PaymentTransaction transaction) {
        return paymentService.processPayment(transaction);
    }

    // GET /api/v1/payments/user/{userId} — all payments for a user (existing)
    @GetMapping("/user/{userId}")
    public List<PaymentTransaction> getUserPayments(@PathVariable Long userId) {
        return paymentService.getPaymentsByUserId(userId);
    }

    // GET /api/v1/payments/{id} — single payment record (receipt view)
    @GetMapping("/{id}")
    public PaymentTransaction getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }
}

