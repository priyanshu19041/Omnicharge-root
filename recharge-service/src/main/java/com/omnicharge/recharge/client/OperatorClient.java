package com.omnicharge.recharge.client;

import com.omnicharge.recharge.dto.RechargePlanDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "operator-service")
public interface OperatorClient {
    @GetMapping("/api/v1/operators/plans/{planId}")
    RechargePlanDto getPlanById(@PathVariable("planId") Long planId);
}
