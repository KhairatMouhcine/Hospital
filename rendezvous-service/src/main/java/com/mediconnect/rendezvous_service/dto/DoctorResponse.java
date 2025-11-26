package com.mediconnect.rendezvous_service.dto;

import lombok.Data;

@Data
public class DoctorResponse {
    private Long id;
    private String fullName;
    private String speciality;
}
