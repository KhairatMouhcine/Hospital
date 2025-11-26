package com.mediconnect.rendezvous_service.services;

import com.mediconnect.rendezvous_service.dto.DoctorResponse;
import com.mediconnect.rendezvous_service.dto.PatientResponse;
import com.mediconnect.rendezvous_service.entities.RendezVous;
import com.mediconnect.rendezvous_service.feign.DoctorClient;
import com.mediconnect.rendezvous_service.feign.PatientClient;
import com.mediconnect.rendezvous_service.repositories.RendezVousRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RendezVousService {
    private final RendezVousRepository repo;
    private final PatientClient patientClient;
    private final DoctorClient doctorClient;

    @CircuitBreaker(name = "rendezvousCB", fallbackMethod = "fallbackCreate")
    @Retry(name = "rendezvousRetry")
    public RendezVous create(Long patientId, Long doctorId, LocalDateTime date) {
        // Vérification de l'existence du patient et du docteur
        PatientResponse patient = patientClient.getPatient(patientId);
        DoctorResponse doctor = doctorClient.getDoctor(doctorId);

        if (patient == null) {
            throw new RuntimeException("Patient avec l'ID " + patientId + " introuvable");
        }
        if (doctor == null) {
            throw new RuntimeException("Docteur avec l'ID " + doctorId + " introuvable");
        }

        RendezVous rdv = new RendezVous();
        rdv.setPatientId(patientId);
        rdv.setDoctorId(doctorId);
        rdv.setDate(date);
        rdv.setStatus(false);
        return repo.save(rdv);
    }

    public RendezVous getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous introuvable avec l'ID : " + id));
    }

    public List<RendezVous> getAll() {
        return repo.findAll();
    }

    @CircuitBreaker(name = "rendezvousCB", fallbackMethod = "fallbackGetByPatientEmail")
    @Retry(name = "rendezvousRetry")
    public List<RendezVous> getByPatientEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("L'email ne peut pas être vide");
        }

        // 1️⃣ Appel au patient-service pour récupérer le patient grâce à l'email
        PatientResponse patient = patientClient.getPatientByEmail(email);

        if (patient == null) {
            throw new RuntimeException("Patient introuvable pour l'email : " + email);
        }

        // 2️⃣ Récupérer les rendez-vous via patientId
        return repo.findByPatientId(patient.getId());
    }

    // ➤ Fallback pour la création (si patient-service ou doctor-service tombe)
    public RendezVous fallbackCreate(Long patientId, Long doctorId, LocalDateTime date, Throwable ex) {
        System.err.println("⚠️ Fallback activé pour create() : " + ex.getMessage());

        RendezVous rdv = new RendezVous();
        rdv.setPatientId(patientId);
        rdv.setDoctorId(doctorId);
        rdv.setDate(date);
        rdv.setStatus(false); // Default logic

        // On sauvegarde quand même pour ne pas perdre la demande
        return repo.save(rdv);
    }

    // ➤ Fallback pour getByPatientEmail (si patient-service tombe)
    public List<RendezVous> fallbackGetByPatientEmail(String email, Throwable ex) {
        System.err.println("⚠️ Fallback activé pour getByPatientEmail() : " + ex.getMessage());

        // Retourner une liste vide plutôt que de planter
        return List.of();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public RendezVous update(Long id, RendezVous updatedInfo) {
        RendezVous rdv = getById(id);
        if (updatedInfo.getDate() != null)
            rdv.setDate(updatedInfo.getDate());
        if (updatedInfo.getDoctorId() != null)
            rdv.setDoctorId(updatedInfo.getDoctorId());
        if (updatedInfo.getPatientId() != null)
            rdv.setPatientId(updatedInfo.getPatientId());
        if (updatedInfo.getStatus() != null)
            rdv.setStatus(updatedInfo.getStatus());
        return repo.save(rdv);
    }

    public RendezVous updateStatus(Long id, Boolean status) {
        RendezVous rdv = getById(id);
        rdv.setStatus(status);
        return repo.save(rdv);
    }
}