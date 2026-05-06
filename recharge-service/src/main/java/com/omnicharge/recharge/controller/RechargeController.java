package com.omnicharge.recharge.controller;

import com.omnicharge.recharge.entity.RechargeRequest;
import com.omnicharge.recharge.service.RechargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/recharges")
@RequiredArgsConstructor
public class RechargeController {

    private final RechargeService rechargeService;

    // POST /api/v1/recharges — initiate a new recharge (existing)
    @PostMapping
    public RechargeRequest initiateRecharge(@RequestBody RechargeRequest request) {
        return rechargeService.initiateRecharge(request);
    }

    // GET /api/v1/recharges/user/{userId} — full recharge history for a user
    @GetMapping("/user/{userId}")
    public List<RechargeRequest> getRechargesByUser(@PathVariable Long userId) {
        return rechargeService.getRechargesByUserId(userId);
    }

    // GET /api/v1/recharges/{id} — single recharge record (receipt / detail view)
    @GetMapping("/{id}")
    public RechargeRequest getRechargeById(@PathVariable Long id) {
        return rechargeService.getRechargeById(id);
    }

    // GET /api/v1/recharges/admin/recharges - get all platform transactions
    @GetMapping("/admin/recharges")
    public List<RechargeRequest> getAllPlatformRecharges() {
        return rechargeService.getAllRecharges();
    }
}

