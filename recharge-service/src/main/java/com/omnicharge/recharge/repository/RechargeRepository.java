package com.omnicharge.recharge.repository;

import com.omnicharge.recharge.entity.RechargeRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RechargeRepository extends JpaRepository<RechargeRequest, Long> {
}
