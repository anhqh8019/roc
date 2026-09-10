package org.venusgiti.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record HotelDashboardResponse(
        LocalDate businessDate,
        Inventory inventory,
        GuestFlow guestFlow,
        Revenue revenue,
        Housekeeping housekeeping
) {
    public record Inventory(
            int totalRooms,
            int occupiedRooms,
            int availableRooms,
            int outOfOrderRooms
    ) {}

    public record GuestFlow(
            int arrivals,
            int departures,
            int inHouse,
            int adults,
            int children
    ) {}

    public record Revenue(
            BigDecimal roomRevenue,
            BigDecimal totalRevenue,
            BigDecimal adr,
            BigDecimal revPar
    ) {}

    public record Housekeeping(
            int clean,
            int dirty,
            int inspected
    ) {}
}