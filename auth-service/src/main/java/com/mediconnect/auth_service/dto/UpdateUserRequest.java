package com.mediconnect.auth_service.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String fullName;
    private String email; // New email
    private String password; // New password (optional)
}
