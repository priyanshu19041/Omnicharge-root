package com.omnicharge.operator.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "recharge_plans")
@Data
public class RechargePlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String planName;
    private String dataBenefits;
    private BigDecimal price;
    private Integer validityDays;
    private String description;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operator_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private TelecomOperator operator;
}
