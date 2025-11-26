package com.mediconnect.rendezvous_service.dto;

import lombok.Data;

@Data
public class PatientResponse {
    private Long id;
    private String fullName;
    private String email;
}
