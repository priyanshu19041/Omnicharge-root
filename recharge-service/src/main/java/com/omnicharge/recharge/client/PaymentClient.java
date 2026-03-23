package com.omnicharge.recharge.client;

import com.omnicharge.recharge.dto.PaymentTransactionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    @PostMapping("/api/v1/payments")
    PaymentTransactionDto makePayment(@RequestBody PaymentTransactionDto transaction);
}
