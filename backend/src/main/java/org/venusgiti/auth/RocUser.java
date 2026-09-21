package org.venusgiti.auth;

public record RocUser(
        Long id,
        String username,
        String passwordHash,
        String fullName,
        UserRole role,
        boolean active
) {
}