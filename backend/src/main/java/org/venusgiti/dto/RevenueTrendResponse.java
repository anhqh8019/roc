package org.venusgiti.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueTrendResponse(
        LocalDate fromDate,
        LocalDate toDate,
        List<RevenuePoint> data
) {

    public record RevenuePoint(
            LocalDate date,
            BigDecimal revenue
    ) {
    }
}