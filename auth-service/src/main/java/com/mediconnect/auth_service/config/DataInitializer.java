package com.mediconnect.auth_service.config;

import com.mediconnect.auth_service.entities.Role;
import com.mediconnect.auth_service.repositories.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            Arrays.asList("PATIENT", "DOCTOR", "ADMIN").forEach(roleName -> {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    System.out.println("✅ Role created: " + roleName);
                }
            });
        };
    }
}
