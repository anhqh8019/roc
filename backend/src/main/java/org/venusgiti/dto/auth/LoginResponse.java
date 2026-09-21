package org.venusgiti.dto.auth;

public record LoginResponse(
        String token,
        String tokenType,
        UserInfo user
) {

    public record UserInfo(
            Long id,
            String username,
            String fullName,
            String role
    ) {
    }
}