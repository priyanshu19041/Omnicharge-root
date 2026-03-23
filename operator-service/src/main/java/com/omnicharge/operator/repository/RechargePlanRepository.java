package com.omnicharge.operator.repository;

import com.omnicharge.operator.entity.RechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RechargePlanRepository extends JpaRepository<RechargePlan, Long> {
    List<RechargePlan> findByOperatorId(Long operatorId);
}
