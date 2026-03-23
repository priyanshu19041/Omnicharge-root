package com.omnicharge.recharge.service;

import com.omnicharge.recharge.client.OperatorClient;
import com.omnicharge.recharge.client.PaymentClient;
import com.omnicharge.recharge.dto.PaymentTransactionDto;
import com.omnicharge.recharge.dto.RechargePlanDto;
import com.omnicharge.recharge.entity.RechargeRequest;
import com.omnicharge.recharge.repository.RechargeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RechargeServiceTest {

    @Mock
    private RechargeRepository repository;

    @Mock
    private OperatorClient operatorClient;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private RechargeService rechargeService;

    private RechargeRequest dummyRequest;
    private RechargePlanDto dummyPlan;

    @BeforeEach
    void setUp() {
        dummyRequest = new RechargeRequest();
        dummyRequest.setUserId(1L);
        dummyRequest.setMobileNumber("9876543210");
        dummyRequest.setOperatorId(1L);
        dummyRequest.setPlanId(1L);

        dummyPlan = new RechargePlanDto();
        dummyPlan.setId(1L);
        dummyPlan.setPrice(new BigDecimal("199.00"));
        dummyPlan.setValidityDays(28);
    }

    @Test
    void shouldFailWhenPlanIsInvalid() {
        when(operatorClient.getPlanById(1L)).thenThrow(new RuntimeException("Operator service down"));
        when(repository.save(any(RechargeRequest.class))).thenAnswer(i -> i.getArguments()[0]);

        RechargeRequest response = rechargeService.initiateRecharge(dummyRequest);

        assertEquals("FAILED", response.getStatus());
        verify(paymentClient, never()).makePayment(any());
    }

    @Test
    void shouldProcessSuccessfulRecharge() {
        when(operatorClient.getPlanById(1L)).thenReturn(dummyPlan);

        PaymentTransactionDto successPayment = new PaymentTransactionDto();
        successPayment.setStatus("SUCCESS");
        successPayment.setTransactionId("TXN12345");

        when(paymentClient.makePayment(any(PaymentTransactionDto.class))).thenReturn(successPayment);
        when(repository.save(any(RechargeRequest.class))).thenAnswer(i -> i.getArguments()[0]);

        RechargeRequest response = rechargeService.initiateRecharge(dummyRequest);

        assertEquals("SUCCESS", response.getStatus());
        assertEquals("TXN12345", response.getPaymentTransactionId());
        assertEquals(new BigDecimal("199.00"), response.getAmount());

        verify(operatorClient).getPlanById(1L);
        verify(paymentClient).makePayment(any(PaymentTransactionDto.class));
        verify(repository).save(any(RechargeRequest.class));
    }
}
