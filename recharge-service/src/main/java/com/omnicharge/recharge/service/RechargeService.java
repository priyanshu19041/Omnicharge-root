package com.omnicharge.recharge.service;

import com.omnicharge.recharge.client.OperatorClient;
import com.omnicharge.recharge.client.PaymentClient;
import com.omnicharge.recharge.dto.PaymentTransactionDto;
import com.omnicharge.recharge.dto.RechargePlanDto;
import com.omnicharge.recharge.entity.RechargeRequest;
import com.omnicharge.recharge.repository.RechargeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RechargeService {

    private final RechargeRepository repository;
    private final OperatorClient operatorClient;
    private final PaymentClient paymentClient;

    public RechargeRequest initiateRecharge(RechargeRequest request) {
        request.setRequestDate(LocalDateTime.now());
        request.setStatus("PENDING");
        
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
}
