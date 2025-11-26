package com.mediconnect.rendezvous_service.Controllers;

import com.mediconnect.rendezvous_service.entities.RendezVous;
import com.mediconnect.rendezvous_service.services.RendezVousService;
import com.mediconnect.rendezvous_service.dto.CreateRdvRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rendezvous")
@RequiredArgsConstructor
public class RendezVousController {
    private final RendezVousService service;

    @PostMapping
    public RendezVous create(@RequestBody CreateRdvRequest request) {
        return service.create(
                request.getPatientId(),
                request.getDoctorId(),
                request.getDate());
    }

    @GetMapping
    public ResponseEntity<List<RendezVous>> getAllRendezVous() {
        List<RendezVous> rdvs = service.getAll();
        return ResponseEntity.ok(rdvs);
    }

    @GetMapping("/{id}")
    public RendezVous getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/me")
    public ResponseEntity<List<RendezVous>> getMyRendezVous(
            @RequestHeader("X-User-Email") String email) {
        List<RendezVous> rdvs = service.getByPatientEmail(email);
        return ResponseEntity.ok(rdvs);
    }

    @PutMapping("/{id}")
    public RendezVous update(@PathVariable Long id, @RequestBody RendezVous rdv) {
        return service.update(id, rdv);
    }

    @PutMapping("/{id}/status")
    public RendezVous updateStatus(@PathVariable Long id, @RequestParam Boolean status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}