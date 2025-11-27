package com.example.facture_service.feign;

import com.example.facture_service.dto.RendezVousResponse;
import org.springframework.stereotype.Component;

@Component
public class RendezVousFallback implements RendezVousClient {

    @Override
    public RendezVousResponse getRendezVous(Long id) {
        // Retourne un objet "vide" quand le service RDV ne répond pas
        RendezVousResponse res = new RendezVousResponse();
        res.setId(id);
        res.setDoctorId(null);
        res.setPatientId(null);
        res.setDate(null);
        return res;
    }
}

