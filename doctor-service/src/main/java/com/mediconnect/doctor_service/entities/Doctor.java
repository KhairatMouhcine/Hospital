package com.mediconnect.doctor_service.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="doctors")
@Data
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String email;
    private String phone;
    private String specialty;   // cardiologie, pédiatrie, etc.
    private String office;      // cabinet / salle
    private String biography;   // description courte
}
