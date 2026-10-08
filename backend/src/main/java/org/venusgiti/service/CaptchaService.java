package org.venusgiti.service;

import org.springframework.stereotype.Service;
import org.venusgiti.dto.auth.CaptchaResponse;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    private static final long TTL_SECONDS = 180;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, Challenge> challenges = new ConcurrentHashMap<>();

    public CaptchaResponse createChallenge() {
        cleanupExpired();

        int left = random.nextInt(8) + 2;
        int right = random.nextInt(8) + 2;
        String id = UUID.randomUUID().toString();

        challenges.put(
                id,
                new Challenge(
                        left + right,
                        Instant.now().plusSeconds(TTL_SECONDS)
                )
        );

        return new CaptchaResponse(
                id,
                left + " + " + right + " = ?",
                (int) TTL_SECONDS
        );
    }

    public boolean verify(String captchaId, String captchaAnswer) {
        if (captchaId == null || captchaAnswer == null) {
            return false;
        }

        Challenge challenge = challenges.remove(captchaId);
        if (challenge == null || Instant.now().isAfter(challenge.expiresAt())) {
            return false;
        }

        try {
            return Integer.parseInt(captchaAnswer.trim()) == challenge.answer();
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    private void cleanupExpired() {
        Instant now = Instant.now();
        challenges.entrySet().removeIf(
                entry -> now.isAfter(entry.getValue().expiresAt())
        );
    }

    private record Challenge(int answer, Instant expiresAt) {
    }
}
