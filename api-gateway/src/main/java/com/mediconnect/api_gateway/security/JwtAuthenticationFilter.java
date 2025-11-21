package com.mediconnect.api_gateway.security;

import com.mediconnect.api_gateway.utils.JwtUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter implements WebFilter, Ordered {

    private final JwtUtil jwtUtil;

    @Override
    public int getOrder() {
        return -1;
    }

    // 🎯 Endpoints accessibles sans token
    private boolean isOpenEndpoint(String path) {
        // Auth microservice
        if (path.equals("/auth")
                || path.equals("/auth/")
                || path.equals("/auth/register")
                || path.equals("/auth/register/")
                || path.equals("/auth/login")
                || path.equals("/auth/login/")) {
            return true;
        }

        // Eureka / Actuator
        if (path.startsWith("/eureka")
                || path.startsWith("/actuator")) {
            return true;
        }

        return false;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        String path = exchange.getRequest().getURI().getPath();
        System.out.println(">>> PATH = " + path);

        // 1️⃣ Endpoints publics → autorisés
        if (isOpenEndpoint(path)) {
            return chain.filter(exchange);
        }

        // 2️⃣ Récupération du token
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return unauthorized(exchange);
        }

        String token = authHeader.substring(7);

        if (!jwtUtil.isTokenValid(token)) {
            return unauthorized(exchange);
        }

        Claims claims = jwtUtil.extractAllClaims(token);

        String email = claims.getSubject();
        String role = claims.get("role", String.class);

        // 3️⃣ Vérification des permissions
        String method = exchange.getRequest().getMethod().name();

        if (!isAuthorized(path, method, role)) {
            return forbidden(exchange);
        }

        // 4️⃣ Injection des headers personnalisés
        ServerWebExchange mutated = exchange.mutate()
                .request(builder -> builder
                        .header("X-User-Email", email)
                        .header("X-User-Role", role))
                .build();

        return chain.filter(mutated);
    }

    // 🎯 Gestion des permissions selon rôle
    private boolean isAuthorized(String path, String method, String role) {

        if (role == null)
            return false;

        role = role.toUpperCase();

        // ADMIN -> accès total
        if (role.equals("ADMIN"))
            return true;

        // DOCTOR
        if (role.equals("DOCTOR")) {
            // Lecture des patients (liste), gestion des rendez-vous, lecture des docteurs
            if (path.startsWith("/api/patients") && !path.contains("/me"))
                return method.equals("GET");
            if (path.startsWith("/api/doctors"))
                return method.equals("GET");
            if (path.startsWith("/api/rendezvous"))
                return true;
            return false;
        }

        // PATIENT
        if (role.equals("PATIENT")) {
            // Son profil uniquement
            if (path.equals("/api/patients/me"))
                return true;

            // Liste des docteurs (pour choisir)
            if (path.startsWith("/api/doctors"))
                return method.equals("GET");

            // Ses rendez-vous
            if (path.startsWith("/api/rendezvous"))
                return true;

            // Payer facture (ex: PUT /api/factures/1/payer)
            if (path.startsWith("/api/factures/") && path.endsWith("/payer"))
                return true;

            // Allow listing factures (client-side filter)
            if (path.equals("/api/factures") && method.equals("GET"))
                return true;

            return false;
        }

        return false;
    }

    private Mono<Void> unauthorized(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return exchange.getResponse().setComplete();
    }

    private Mono<Void> forbidden(ServerWebExchange exchange) {
        exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
        return exchange.getResponse().setComplete();
    }
}
