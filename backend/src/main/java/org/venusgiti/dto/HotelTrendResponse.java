package org.venusgiti.dto;


import java.math.BigDecimal;
import java.time.LocalDate;

public record HotelTrendResponse(
        LocalDate businessDate,
        int occupiedRooms,
        BigDecimal occupancyPercent,
        BigDecimal roomNetRevenue,
        BigDecimal totalNetRevenue,
        BigDecimal adr,
        BigDecimal revPar
) {
}