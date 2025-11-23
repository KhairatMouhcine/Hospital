package com.mediconnect.auth_service.services;

import com.mediconnect.auth_service.dto.LoginRequest;
import com.mediconnect.auth_service.dto.LoginResponse;
import com.mediconnect.auth_service.dto.RegisterRequest;
import com.mediconnect.auth_service.entities.Role;
import com.mediconnect.auth_service.entities.User;
import com.mediconnect.auth_service.repositories.RoleRepository;
import com.mediconnect.auth_service.repositories.UserRepository;
import com.mediconnect.auth_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ===================== 1️⃣ Registration =========================

    public String register(RegisterRequest request) {

        // Vérifier si email existe
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        // Récupérer le rôle demandé
        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new RuntimeException("Role invalide"));

        // Créer un user
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // Hash
        user.setPhone(request.getPhone());
        user.setRole(role); // 👈 rôle assigné

        userRepository.save(user);

        return "Utilisateur créé avec succès";
    }

    // ===================== 2️⃣ Login =========================

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email incorrect"));

        // Vérifier mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // EXTRAIRE LE RÔLE POUR JWT
        String role = user.getRole().getName();

        // Générer JWT avec rôle inclus
        String token = jwtUtil.generateToken(user.getEmail(), role);

        return new LoginResponse(
                token,
                user.getEmail(),
                role);
    }

    // ===================== 3️⃣ Update =========================

    public String updateUser(String currentEmail, com.mediconnect.auth_service.dto.UpdateUserRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equals(currentEmail)) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Nouvel email déjà utilisé");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return "Utilisateur mis à jour avec succès";
    }

    // ===================== 4️⃣ Delete =========================

    public void deleteUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        userRepository.delete(user);
    }
}
