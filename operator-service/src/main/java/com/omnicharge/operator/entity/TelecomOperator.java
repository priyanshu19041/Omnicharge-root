package com.omnicharge.operator.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "telecom_operators")
@Data
public class TelecomOperator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String region;
    
    private Boolean active = true;

    @OneToMany(mappedBy = "operator", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private java.util.List<RechargePlan> plans;
}
