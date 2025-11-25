package com.mediconnect.patient_service.repositories;

import com.mediconnect.patient_service.entities.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email); //
}

