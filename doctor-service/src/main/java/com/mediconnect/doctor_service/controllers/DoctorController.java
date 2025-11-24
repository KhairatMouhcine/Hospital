package com.mediconnect.doctor_service.controllers;

import com.mediconnect.doctor_service.entities.Doctor;
import com.mediconnect.doctor_service.services.DoctorService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    @GetMapping
    public List<Doctor> all() {
        return service.all();
    }

    @GetMapping("/{id}")
    public Doctor one(@PathVariable Long id) {
        return service.one(id);
    }

    @PostMapping
    public Doctor create(@RequestBody Doctor doctor) {
        return service.create(doctor);
    }

    @PutMapping("/{id}")
    public Doctor update(@PathVariable Long id, @RequestBody Doctor doctor) {
        return service.update(id, doctor);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

