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
    
    public List<RechargePlan> getPlansByOperatorId(Long operatorId) {
        return planRepository.findByOperatorId(operatorId);
    }
    
    public RechargePlan getPlanById(Long planId) {
        return planRepository.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));
    }
}
