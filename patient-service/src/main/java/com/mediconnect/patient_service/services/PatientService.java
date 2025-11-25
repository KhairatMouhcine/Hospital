package com.mediconnect.patient_service.services;

import com.mediconnect.patient_service.entities.Patient;
import com.mediconnect.patient_service.repositories.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Patient getPatient(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient introuvable"));
    }

    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient updatePatient(Long id, Patient updated) {
        Patient p = getPatient(id);
        p.setFullName(updated.getFullName());
        p.setEmail(updated.getEmail());
        p.setPhone(updated.getPhone());
        p.setBirthDate(updated.getBirthDate());
        p.setAddress(updated.getAddress());
        p.setGender(updated.getGender());
        p.setMedicalHistory(updated.getMedicalHistory());
        return patientRepository.save(p);
    }

    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }

    public Patient getByEmail(String email) {
        return patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Patient not found with email: " + email));
    }

}

