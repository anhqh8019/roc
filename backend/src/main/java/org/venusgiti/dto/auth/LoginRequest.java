package org.venusgiti.dto.auth;

public record LoginRequest(
        String username,
        String password
) {
}