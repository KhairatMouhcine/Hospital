package com.mediconnect.doctor_service.repositories;

import com.mediconnect.doctor_service.entities.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}

