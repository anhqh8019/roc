package org.venusgiti.dto;

import java.math.BigDecimal;
import java.util.List;

public record MonthlyOperationsReportResponse(
        int year,
        int toMonth,
        List<MonthlyRow> months
) {
    public record MonthlyRow(
            int month,
            BigDecimal villaRevenue,
            BigDecimal hotelRevenue,
            BigDecimal onsenRevenue,
            BigDecimal restaurantRevenue,
            int villaRoomsSold,
            int hotelRoomsSold,
            BigDecimal unallocatedRoomRevenue,
            BigDecimal totalRoomRevenue,
            BigDecimal reconciliationDifference
    ) {}
}
