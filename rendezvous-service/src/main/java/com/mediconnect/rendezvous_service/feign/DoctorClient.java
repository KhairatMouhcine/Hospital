package com.mediconnect.rendezvous_service.feign;

import com.mediconnect.rendezvous_service.dto.DoctorResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "doctor-service")
public interface DoctorClient {

    @GetMapping("/api/doctors/{id}")
    DoctorResponse getDoctor(@PathVariable Long id);
}

