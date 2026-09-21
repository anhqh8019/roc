package org.venusgiti.dto;

import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public record RoomDetailResponse(
        String roomCode,
        String roomType,
        String roomTypeName,
        String zone,

        OccupancyStatus occupancyStatus,
        HousekeepingStatus housekeepingStatus,
        boolean inspected,

        StayInfo currentStay
) {

    public record StayInfo(
            String folioNum,
            LocalDate arrivalDate,
            LocalDate departureDate,
            int adults,
            int children,
            BigDecimal rateAmount
    ) {
    }
}