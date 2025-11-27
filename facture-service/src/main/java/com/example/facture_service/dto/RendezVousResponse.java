package com.example.facture_service.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RendezVousResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private LocalDateTime date;
}