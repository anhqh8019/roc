package org.venusgiti.dto;

import org.venusgiti.util.DepartureStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record DepartureItemResponse(
        String folioNum,
        String roomCode,
        String roomType,
        String roomTypeName,

        LocalDate arrivalDate,
        LocalDate departureDate,

        int adults,
        int children,

        BigDecimal rateAmount,

        DepartureStatus status,

        LocalDateTime checkInTime,
        LocalDateTime checkOutTime
) {
}