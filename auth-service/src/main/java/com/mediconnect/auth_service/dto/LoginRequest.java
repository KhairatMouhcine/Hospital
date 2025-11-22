package com.mediconnect.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data  //getters + setters par defaut
public class LoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    public LoginRequest() {}

    // Getters & Setters
}

//Quand un utilisateur se connecte, tu lui renvoies :
//
//un token JWT
//
//son email
//
//son rôle