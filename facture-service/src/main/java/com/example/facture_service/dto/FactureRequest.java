package com.example.facture_service.dto;

import lombok.Data;

@Data
public class FactureRequest {
    private Long rendezVousId;
    private String typeConsultation; // "GENERAL", "SPECIALISTE", "URGENCE"
    private boolean assurance;

    // Added for Update operations
    private Double montant;
    private String status;
}
