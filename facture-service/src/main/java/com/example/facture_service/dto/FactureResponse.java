package com.example.facture_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FactureResponse {
    private Long id;
    private Long rendezVousId;
    private Double montant;
    private String status;
    private LocalDateTime dateCreation;
}
