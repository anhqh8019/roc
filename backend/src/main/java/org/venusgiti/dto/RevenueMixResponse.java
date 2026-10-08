package org.venusgiti.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record RevenueMixResponse(
        LocalDate date,
        BigDecimal totalRevenue,
        List<BusinessUnitRevenue> businessUnits
) {

    public record BusinessUnitRevenue(
            String businessUnit,
            BigDecimal revenue,
            double contributionPercent
    ) {
    }
}