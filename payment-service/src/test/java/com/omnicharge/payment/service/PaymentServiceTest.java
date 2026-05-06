package com.omnicharge.payment.service;

import com.omnicharge.payment.config.RabbitMQConfig;
import com.omnicharge.payment.entity.PaymentTransaction;
import com.omnicharge.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository repository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private PaymentService paymentService;

    private PaymentTransaction dummyPayment;

    @BeforeEach
    void setUp() {
        dummyPayment = new PaymentTransaction();
        dummyPayment.setUserId(1L);
        dummyPayment.setRechargePlanId(11L);
        dummyPayment.setAmount(new BigDecimal("199.00"));
    }

    @Test
    void shouldProcessPaymentSuccessfully() {
        PaymentTransaction savedPayment = new PaymentTransaction();
        savedPayment.setId(100L);
        savedPayment.setUserId(1L);
        savedPayment.setRechargePlanId(11L);
        savedPayment.setAmount(new BigDecimal("199.00"));
        savedPayment.setStatus("SUCCESS");
        savedPayment.setTransactionId("mock-uuid");
        savedPayment.setTimestamp(LocalDateTime.now());

        when(repository.save(any(PaymentTransaction.class))).thenReturn(savedPayment);

        PaymentTransaction result = paymentService.processPayment(dummyPayment);

        assertNotNull(result);
        assertEquals("SUCCESS", result.getStatus());
        assertNotNull(result.getTransactionId());
        assertNotNull(result.getTimestamp());
        assertEquals(savedPayment.getId(), result.getId());

        verify(repository).save(dummyPayment);
        verify(rabbitTemplate).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME),
                eq(RabbitMQConfig.ROUTING_KEY),
                anyString()
        );
    }

    @Test
    void shouldGetPaymentsByUserId() {
        when(repository.findByUserId(1L)).thenReturn(Arrays.asList(dummyPayment));

        List<PaymentTransaction> payments = paymentService.getPaymentsByUserId(1L);

        assertNotNull(payments);
        assertEquals(1, payments.size());
        assertEquals(1L, payments.get(0).getUserId());
        assertEquals(new BigDecimal("199.00"), payments.get(0).getAmount());
        verify(repository).findByUserId(1L);
    }
}
