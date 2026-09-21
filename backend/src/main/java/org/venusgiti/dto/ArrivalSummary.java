package org.venusgiti.dto;

public record ArrivalSummary(
        int total,
        int expected,
        int checkedIn,
        int cancelled,
        int noShow
) {
}