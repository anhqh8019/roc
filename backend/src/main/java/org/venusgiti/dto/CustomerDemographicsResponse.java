package org.venusgiti.dto;

import java.time.LocalDate;
import java.util.List;

public record CustomerDemographicsResponse(
        LocalDate date,
        int totalGuests,
        DemographicCoverage demographicCoverage,
        List<AgeGroup> ageGroups,
        List<GenderGroup> gender,
        List<NationalityGroup> nationalities
) {

    public record DemographicCoverage(
            int knownAge,
            int unknownAge,
            double ageCoveragePercent
    ) {
    }

    public record AgeGroup(
            String group,
            int guests,
            double percent
    ) {
    }

    public record GenderGroup(
            String gender,
            int guests,
            double percent
    ) {
    }

    public record NationalityGroup(
            String nationality,
            int guests,
            double percent
    ) {
    }
}