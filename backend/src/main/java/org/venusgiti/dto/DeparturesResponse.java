package org.venusgiti.dto;

import java.time.LocalDate;
import java.util.List;

public record DeparturesResponse(
        LocalDate businessDate,
        DepartureSummary summary,
        List<DepartureItemResponse> departures
) {
}