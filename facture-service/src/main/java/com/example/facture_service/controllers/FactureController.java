package com.example.facture_service.controllers;

import com.example.facture_service.dto.FactureRequest;
import com.example.facture_service.dto.FactureResponse;
import com.example.facture_service.entities.Facture;
import com.example.facture_service.repositories.FactureRepository;
import com.example.facture_service.services.FactureService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;
    private final FactureRepository factureRepository;

    @PostMapping
    public FactureResponse create(@RequestBody FactureRequest request) {
        return factureService.createFacture(request);
    }

    @GetMapping
    public List<Facture> getAll() {
        return factureRepository.findAll();
    }

    @GetMapping("/{id}")
    public Facture getOne(@PathVariable Long id) {
        return factureRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}/payer")
    public FactureResponse payer(@PathVariable Long id) {
        return factureService.payerFacture(id);
    }

    @PutMapping("/{id}")
    public FactureResponse update(@PathVariable Long id, @RequestBody FactureRequest request) {
        return factureService.updateFacture(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        factureService.deleteFacture(id);
    }
}
