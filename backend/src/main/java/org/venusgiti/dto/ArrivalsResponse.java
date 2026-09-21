package org.venusgiti.dto;

import java.time.LocalDate;
import java.util.List;

public record ArrivalsResponse(
        LocalDate businessDate,
        ArrivalSummary summary,
        List<ArrivalItemResponse> arrivals
) {
}