package com.mediconnect.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String fullName;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    private String phone;

    @NotBlank
    private String role; // PATIENT, DOCTOR, ADMIN

    public RegisterRequest() {}

    // Getters & Setters
}

//Tu protèges les champs (pas de vide, email valide, password min 6)

//C’est ce que le front t’envoie lorsqu’un utilisateur crée un compte