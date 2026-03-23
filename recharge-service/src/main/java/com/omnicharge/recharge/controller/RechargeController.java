package com.omnicharge.recharge.controller;

import com.omnicharge.recharge.entity.RechargeRequest;
import com.omnicharge.recharge.service.RechargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recharges")
@RequiredArgsConstructor
public class RechargeController {

    private final RechargeService rechargeService;

    @PostMapping
    public RechargeRequest initiateRecharge(@RequestBody RechargeRequest request) {
        return rechargeService.initiateRecharge(request);
    }
}
