package com.mediconnect.auth_service.entities;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // ADMIN, DOCTOR, PATIENT

    // Constructeurs
    public Role() {}

    public Role(String name) {
        this.name = name;
    }

    // Getters & setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
