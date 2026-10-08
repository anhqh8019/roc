package org.venusgiti.dto;

import java.time.LocalDate;

public record CustomerMixResponse(
        LocalDate date,
        int hotelGuests,
        ServiceUsage onsen,
        BreakfastUsage breakfast
) {

    public record ServiceUsage(
            boolean available,
            Integer usedGuests,
            Integer notUsedGuests,
            Double conversionPercent
    ) {
    }

    public record BreakfastUsage(
            boolean available,
            Integer eligibleGuests,
            Integer usedGuests,
            Integer notUsedGuests,
            Double utilizationPercent
    ) {
    }
}