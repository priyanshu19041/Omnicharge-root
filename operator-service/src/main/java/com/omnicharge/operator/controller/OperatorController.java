package com.omnicharge.operator.controller;

import com.omnicharge.operator.entity.RechargePlan;
import com.omnicharge.operator.entity.TelecomOperator;
import com.omnicharge.operator.service.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/operators")
@RequiredArgsConstructor
public class OperatorController {
    private final OperatorService operatorService;

    // ── Operator endpoints ────────────────────────────────────────────────

    @GetMapping
    public List<TelecomOperator> getAll() {
        return operatorService.getAllOperators();
    }

    @GetMapping("/{id}")
    public TelecomOperator getById(@PathVariable Long id) {
        return operatorService.getOperatorById(id);
    }

    @PostMapping
    public TelecomOperator createOperator(@RequestBody TelecomOperator operator) {
        return operatorService.createOperator(operator);
    }

    @PutMapping("/{id}")
    public TelecomOperator updateOperator(@PathVariable Long id,
                                          @RequestBody TelecomOperator operator) {
        return operatorService.updateOperator(id, operator);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOperator(@PathVariable Long id) {
        operatorService.deleteOperator(id);
        return ResponseEntity.noContent().build();
    }

    // ── Plan endpoints ────────────────────────────────────────────────────

    // GET all plans across all operators (for browse-all-plans view)
    @GetMapping("/plans")
    public List<RechargePlan> getAllPlans() {
        return operatorService.getAllPlans();
    }

    @GetMapping("/{operatorId}/plans")
    public List<RechargePlan> getPlansByOperator(@PathVariable Long operatorId) {
        return operatorService.getPlansByOperatorId(operatorId);
    }

    @GetMapping("/plans/{planId}")
    public RechargePlan getPlanById(@PathVariable Long planId) {
        return operatorService.getPlanById(planId);
    }

    @PostMapping("/{operatorId}/plans")
    public RechargePlan createPlan(@PathVariable Long operatorId,
                                   @RequestBody RechargePlan plan) {
        return operatorService.createPlan(operatorId, plan);
    }

    @PutMapping("/plans/{planId}")
    public RechargePlan updatePlan(@PathVariable Long planId,
                                   @RequestBody RechargePlan plan) {
        return operatorService.updatePlan(planId, plan);
    }

    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        operatorService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}

