package com.mediconnect.auth_service.controllers;

import com.mediconnect.auth_service.dto.LoginRequest;
import com.mediconnect.auth_service.dto.LoginResponse;
import com.mediconnect.auth_service.dto.RegisterRequest;
import com.mediconnect.auth_service.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // ================== REGISTER ====================

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(message);
    }

    // ================== LOGIN ====================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // ================== UPDATE ====================

    @PutMapping("/users/{email:.+}")
    public ResponseEntity<String> updateUser(@PathVariable String email,
            @RequestBody com.mediconnect.auth_service.dto.UpdateUserRequest request) {
        String message = authService.updateUser(email, request);
        return ResponseEntity.ok(message);
    }

    // ================== DELETE ====================

    @DeleteMapping("/users/{email:.+}")
    public ResponseEntity<String> deleteUser(@PathVariable String email) {
        authService.deleteUser(email);
        return ResponseEntity.ok("Utilisateur supprimé");
    }
}
