package com.omnicharge.recharge.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class RechargePlanDto {
    private Long id;
    private BigDecimal price;
    private Integer validityDays;
}
