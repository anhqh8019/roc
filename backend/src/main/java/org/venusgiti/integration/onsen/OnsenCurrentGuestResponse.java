package org.venusgiti.integration.onsen;

import java.time.LocalDateTime;

public record OnsenCurrentGuestResponse(
        String cardNo,
        Integer folioNum,
        String packageCode,
        LocalDateTime checkInTime,
        long durationMinutes
) {
}