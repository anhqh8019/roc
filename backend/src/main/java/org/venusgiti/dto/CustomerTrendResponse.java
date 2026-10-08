package org.venusgiti.dto;

import java.time.LocalDate;
import java.util.List;

public record CustomerTrendResponse(
        LocalDate fromDate,
        LocalDate toDate,
        List<CustomerPoint> data
) {
    public record CustomerPoint(
            LocalDate date,
            int adults,
            int children,
            int unknownAge
    ) {
    }
}
