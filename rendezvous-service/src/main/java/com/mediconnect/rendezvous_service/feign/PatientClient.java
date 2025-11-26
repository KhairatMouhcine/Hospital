package com.mediconnect.rendezvous_service.feign;

import com.mediconnect.rendezvous_service.dto.PatientResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "patient-service")
public interface PatientClient {

    @GetMapping("/api/patients/{id}")
    PatientResponse getPatient(@PathVariable Long id);

    @GetMapping("/api/patients/by-email")
    PatientResponse getPatientByEmail(@RequestParam String email);
}
