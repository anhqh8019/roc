package org.venusgiti.dto;

import org.venusgiti.util.ArrivalStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ArrivalItemResponse(
        String folioNum,
        String roomCode,
        String roomType,
        String roomTypeName,

        LocalDate arrivalDate,
        LocalDate departureDate,

        int adults,
        int children,

        BigDecimal rateAmount,

        ArrivalStatus status,

        LocalDateTime checkInTime,
        LocalDateTime cancelTime,

        boolean noShow,
        boolean walkIn
) {
}