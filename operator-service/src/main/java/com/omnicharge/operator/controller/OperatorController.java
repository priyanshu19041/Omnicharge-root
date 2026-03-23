package com.omnicharge.operator.controller;

import com.omnicharge.operator.entity.RechargePlan;
import com.omnicharge.operator.entity.TelecomOperator;
import com.omnicharge.operator.service.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/operators")
@RequiredArgsConstructor
public class OperatorController {
    private final OperatorService operatorService;
    
    @GetMapping
    public List<TelecomOperator> getAll() {
        return operatorService.getAllOperators();
    }
    
    @GetMapping("/{operatorId}/plans")
    public List<RechargePlan> getPlansByOperator(@PathVariable Long operatorId) {
        return operatorService.getPlansByOperatorId(operatorId);
    }
    
    @GetMapping("/plans/{planId}")
    public RechargePlan getPlanById(@PathVariable Long planId) {
        return operatorService.getPlanById(planId);
    }
}
