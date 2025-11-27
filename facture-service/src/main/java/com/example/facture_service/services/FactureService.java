package com.example.facture_service.services;

import com.example.facture_service.dto.FactureRequest;
import com.example.facture_service.dto.FactureResponse;
import com.example.facture_service.dto.RendezVousResponse;
import com.example.facture_service.entities.Facture;
import com.example.facture_service.feign.RendezVousClient;
import com.example.facture_service.repositories.FactureRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository repo;
    private final RendezVousClient rendezVousClient;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${facture.kafka.topic}")
    private String topic;

    @CircuitBreaker(name = "factureCB", fallbackMethod = "fallbackRendezVous")
    @Retry(name = "factureRetry")
    public FactureResponse createFacture(FactureRequest request) {

        // --- 1) Vérifier le rendez-vous ---
        RendezVousResponse rdv = rendezVousClient.getRendezVous(request.getRendezVousId());

        // --- 2) Calcul du montant ---
        double montant = switch (request.getTypeConsultation()) {
            case "GENERAL" -> 200;
            case "SPECIALISTE" -> 300;
            case "URGENCE" -> 500;
            default -> 0;
        };

        if (request.isAssurance()) {
            montant *= 0.7; // réduction assurance
        }

        // --- 3) Créer la facture ---
        Facture facture = new Facture();
        facture.setRendezVousId(rdv.getId());
        facture.setMontant(montant);
        facture.setStatus("EN_ATTENTE");
        facture.setDateCreation(LocalDateTime.now());

        Facture saved = repo.save(facture);

        // --- 4) Envoyer Kafka (OPTIONNEL, NON BLOQUANT) ---
        // --- 4) Envoyer Kafka (OPTIONNEL, NON BLOQUANT) ---
        /*
         * try {
         * kafkaTemplate.send(topic, "Nouvelle facture : " + saved.getId());
         * } catch (Exception e) {
         * System.out.println("⚠️ Kafka indisponible → message ignoré");
         * }
         */

        // --- 5) Construire la réponse ---
        FactureResponse response = new FactureResponse();
        BeanUtils.copyProperties(saved, response);

        return response;
    }

    // Fallback résilience si rendezvous-service ne répond pas
    public FactureResponse fallbackRendezVous(FactureRequest request, Throwable ex) {

        FactureResponse response = new FactureResponse();
        response.setRendezVousId(request.getRendezVousId());
        response.setStatus("SERVICE_RDV_INDISPONIBLE");
        response.setMontant(0.0);

        System.out.println("⚠️ Fallback activé : " + ex.getMessage());

        return response;
    }

    public FactureResponse payerFacture(Long id) {
        // 1) Récupérer la facture
        Facture facture = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable"));

        // 2) Vérifier l’état actuel (optionnel mais propre)
        if ("PAYEE".equals(facture.getStatus())) {
            throw new RuntimeException("Facture déjà payée");
        }

        // 3) Mettre à jour le statut
        facture.setStatus("PAYEE");

        // 4) Sauvegarder
        Facture saved = repo.save(facture);

        // 5) (optionnel) : envoyer un message Kafka "facture payée"
        // String message = "Facture payée: ID=" + saved.getId();
        // kafkaTemplate.send(topic, message);

        // 6) Mapper vers DTO
        FactureResponse response = new FactureResponse();
        BeanUtils.copyProperties(saved, response);
        return response;
    }

    public void deleteFacture(Long id) {
        repo.deleteById(id);
    }

    public FactureResponse updateFacture(Long id, FactureRequest request) {
        Facture facture = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable"));

        // Only update fields if provided/needed.
        // If Logic changes based on request (e.g. amount modification), careful with
        // syncing.
        if (request.getMontant() != null) {
            facture.setMontant(request.getMontant());
        }
        if (request.getStatus() != null) {
            facture.setStatus(request.getStatus());
        }

        // If RDV ID changes, we should probably verify it exists again... but keeping
        // it simple for now as per usual patterns.
        if (request.getRendezVousId() != null) {
            facture.setRendezVousId(request.getRendezVousId());
        }

        Facture saved = repo.save(facture);
        FactureResponse response = new FactureResponse();
        BeanUtils.copyProperties(saved, response);
        return response;
    }
}
