package com.example.facture_service.feign;

import com.example.facture_service.dto.RendezVousResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "RENDEZVOUS-SERVICE",
        fallback = RendezVousFallback.class
)
public interface RendezVousClient {

    @GetMapping("/api/rendezvous/{id}")
    RendezVousResponse getRendezVous(@PathVariable("id") Long id);
}





