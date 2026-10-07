package org.venusgiti.integration.onsen;

import java.time.LocalDate;

public record OnsenTrendResponse(
        LocalDate date,
        int guests
) {
}