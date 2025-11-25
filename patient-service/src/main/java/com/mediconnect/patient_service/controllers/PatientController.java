package com.mediconnect.patient_service.controllers;

import com.mediconnect.patient_service.entities.Patient;
import com.mediconnect.patient_service.services.PatientService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public List<Patient> getAll() {
        return patientService.getAllPatients();
    }

    @GetMapping("/{id}")
    public Patient getById(@PathVariable Long id) {
        return patientService.getPatient(id);
    }

    @PostMapping
    public Patient create(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @PutMapping("/{id}")
    public Patient update(@PathVariable Long id, @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        patientService.deletePatient(id);
    }

    @GetMapping("/me")
    public Patient getMyPatientInfo(@RequestHeader("X-User-Email") String email) {
        return patientService.getByEmail(email);
    }

    @GetMapping("/by-email")
    public Patient getByEmail(@RequestParam String email) {
        return patientService.getByEmail(email);
    }
}
