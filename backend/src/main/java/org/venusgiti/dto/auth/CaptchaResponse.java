package org.venusgiti.dto.auth;

public record CaptchaResponse(
        String captchaId,
        String question,
        int expiresInSeconds
) {
}
