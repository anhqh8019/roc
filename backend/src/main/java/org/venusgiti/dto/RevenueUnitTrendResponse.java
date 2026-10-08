package org.venusgiti.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueUnitTrendResponse(
        LocalDate fromDate,
        LocalDate toDate,
        List<RevenueUnitPoint> data
) {
    public record RevenueUnitPoint(
            LocalDate date,
            BigDecimal hotel,
            BigDecimal foodBeverage,
            BigDecimal onsen,
            BigDecimal spa,
            BigDecimal other
    ) {
    }
}
