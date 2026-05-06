package com.omnicharge.recharge.service;

import com.omnicharge.recharge.client.OperatorClient;
import com.omnicharge.recharge.client.PaymentClient;
import com.omnicharge.recharge.client.UserClient;
import com.omnicharge.recharge.dto.PaymentTransactionDto;
import com.omnicharge.recharge.dto.RechargePlanDto;
import com.omnicharge.recharge.dto.UserDto;
import com.omnicharge.recharge.entity.RechargeRequest;
import com.omnicharge.recharge.repository.RechargeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RechargeService {

    private final RechargeRepository repository;
    private final OperatorClient operatorClient;
    private final PaymentClient paymentClient;
    private final UserClient userClient;

    public RechargeRequest initiateRecharge(RechargeRequest request) {
        request.setRequestDate(LocalDateTime.now());
        request.setStatus("PENDING");

        // 0. Validate User Existence
        try {
            UserDto user = userClient.getUserById(request.getUserId());
            if (user == null) {
                throw new RuntimeException("Validation Failed: User not found");
            }
            // Mobile number validation removed: User can recharge any number
        } catch (RuntimeException e) {
            log.error("User Validation Error", e);
            throw e; // Handled nicely by Global Exception Handler
        }

        // 1. Validate Plan with Operator Service
        RechargePlanDto plan;
        try {
            plan = operatorClient.getPlanById(request.getPlanId());
            if (plan == null) throw new RuntimeException("Invalid Plan ID");
        } catch (Exception e) {
            log.error("Failed to fetch plan from Operator Service", e);
            request.setStatus("FAILED");
            return repository.save(request);
        }

        request.setAmount(plan.getPrice());

        // 2. Process Payment via Payment Service
        PaymentTransactionDto paymentReq = new PaymentTransactionDto();
        paymentReq.setUserId(request.getUserId());
        paymentReq.setAmount(request.getAmount());
        paymentReq.setRechargePlanId(request.getPlanId());

        try {
            PaymentTransactionDto paymentRes = paymentClient.makePayment(paymentReq);
            if ("SUCCESS".equals(paymentRes.getStatus())) {
                request.setStatus("SUCCESS");
                request.setPaymentTransactionId(paymentRes.getTransactionId());
            } else {
                request.setStatus("FAILED");
            }
        } catch (Exception e) {
            log.error("Payment failed", e);
            request.setStatus("FAILED");
        }

        return repository.save(request);
    }

    // Get full recharge history for a user (powers the History page)
    public List<RechargeRequest> getRechargesByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    // Get a single recharge record by ID (for receipt / detail view)
    public RechargeRequest getRechargeById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recharge record not found"));
    }

    public List<RechargeRequest> getAllRecharges() {
        return repository.findAll();
    }
}

