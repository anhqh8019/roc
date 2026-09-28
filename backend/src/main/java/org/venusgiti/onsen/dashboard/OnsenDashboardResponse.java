package org.venusgiti.onsen.dashboard;

import java.time.LocalDate;

public record OnsenDashboardResponse(
        LocalDate businessDate,
        int currentGuests,
        int checkIns,
        int checkOuts,
        boolean live
) {
}
