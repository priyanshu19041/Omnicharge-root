package com.omnicharge.recharge.repository;

import com.omnicharge.recharge.entity.RechargeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RechargeRepository extends JpaRepository<RechargeRequest, Long> {
    List<RechargeRequest> findByUserId(Long userId);
}

