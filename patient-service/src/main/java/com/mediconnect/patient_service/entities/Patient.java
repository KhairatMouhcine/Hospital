package com.mediconnect.patient_service.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Data
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    private String email;

    private String phone;

    private LocalDate birthDate;

    private String address;

    private String gender; // M, F, Autre

    private String medicalHistory; // résumé textuel
}

