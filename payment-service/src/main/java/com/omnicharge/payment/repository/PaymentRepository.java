package com.omnicharge.payment.repository;

import com.omnicharge.payment.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByUserId(Long userId);
}
