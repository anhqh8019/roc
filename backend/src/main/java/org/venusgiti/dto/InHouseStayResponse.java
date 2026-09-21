package org.venusgiti.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record InHouseStayResponse(
        String folioNum,
        String roomCode,
        String roomType,
        String roomTypeName,
        LocalDate arrivalDate,
        LocalDate departureDate,
        int adults,
        int children,
        BigDecimal rateAmount,
        LocalDateTime checkInTime
) {
}