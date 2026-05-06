package com.omnicharge.operator.service;

import com.omnicharge.operator.entity.RechargePlan;
import com.omnicharge.operator.entity.TelecomOperator;
import com.omnicharge.operator.repository.RechargePlanRepository;
import com.omnicharge.operator.repository.TelecomOperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OperatorService {
    private final TelecomOperatorRepository operatorRepository;
    private final RechargePlanRepository planRepository;

    public List<TelecomOperator> getAllOperators() {
        return operatorRepository.findAll();
    }

    public TelecomOperator getOperatorById(Long id) {
        return operatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
    }

    public TelecomOperator createOperator(TelecomOperator operator) {
        return operatorRepository.save(operator);
    }

    public TelecomOperator updateOperator(Long id, TelecomOperator updated) {
        TelecomOperator existing = getOperatorById(id);
        if (updated.getName() != null)   existing.setName(updated.getName());
        if (updated.getRegion() != null) existing.setRegion(updated.getRegion());
        return operatorRepository.save(existing);
    }

    public void deleteOperator(Long id) {
        getOperatorById(id); // throws if not found
        operatorRepository.deleteById(id);
    }

    public List<RechargePlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<RechargePlan> getPlansByOperatorId(Long operatorId) {
        return planRepository.findByOperatorId(operatorId);
    }

    public RechargePlan getPlanById(Long planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    public RechargePlan createPlan(Long operatorId, RechargePlan plan) {
        TelecomOperator operator = getOperatorById(operatorId);
        plan.setOperator(operator);
        return planRepository.save(plan);
    }

    public RechargePlan updatePlan(Long planId, RechargePlan updated) {
        RechargePlan existing = getPlanById(planId);
        if (updated.getPlanName() != null)    existing.setPlanName(updated.getPlanName());
        if (updated.getDataBenefits() != null) existing.setDataBenefits(updated.getDataBenefits());
        if (updated.getPrice() != null)       existing.setPrice(updated.getPrice());
        if (updated.getValidityDays() != null) existing.setValidityDays(updated.getValidityDays());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        return planRepository.save(existing);
    }

    public void deletePlan(Long planId) {
        getPlanById(planId); // throws if not found
        planRepository.deleteById(planId);
    }
}

