package org.venusgiti.dto;

public record DepartureSummary(
        int total,
        int dueOut,
        int checkedOut
) {
}