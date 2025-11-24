package com.mediconnect.doctor_service.services;

import com.mediconnect.doctor_service.entities.Doctor;
import com.mediconnect.doctor_service.repositories.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository repo;

    public DoctorService(DoctorRepository repo) {
        this.repo = repo;
    }

    public List<Doctor> all() {
        return repo.findAll();
    }

    public Doctor one(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Médecin introuvable"));
    }

    public Doctor create(Doctor d) {
        return repo.save(d);
    }

    public Doctor update(Long id, Doctor data) {
        Doctor d = one(id);
        d.setFullName(data.getFullName());
        d.setEmail(data.getEmail());
        d.setPhone(data.getPhone());
        d.setSpecialty(data.getSpecialty());
        d.setOffice(data.getOffice());
        d.setBiography(data.getBiography());
        return repo.save(d);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}

