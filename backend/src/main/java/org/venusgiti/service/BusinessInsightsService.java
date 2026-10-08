package org.venusgiti.service;

import org.springframework.stereotype.Service;
import org.venusgiti.dto.CustomerDemographicsResponse;
import org.venusgiti.dto.CustomerMixResponse;
import org.venusgiti.dto.RevenueMixResponse;
import org.venusgiti.dto.RevenueTrendResponse;
import org.venusgiti.repository.SmileBusinessInsightsRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BusinessInsightsService {

    private final SmileBusinessInsightsRepository repository;

    public BusinessInsightsService(
            SmileBusinessInsightsRepository repository
    ) {
        this.repository = repository;
    }

    public CustomerDemographicsResponse getCustomerDemographics(
            LocalDate businessDate
    ) {

        List<SmileBusinessInsightsRepository.AgeGroupRow> ageRows =
                repository.getAgeGroups(businessDate);

        List<SmileBusinessInsightsRepository.GenderRow> genderRows =
                repository.getGenderGroups(businessDate);

        List<SmileBusinessInsightsRepository.NationalityRow> nationalityRows =
                repository.getNationalityGroups(businessDate);

        /*
         * Age groups are based on the complete HotelGuests population,
         * including UNKNOWN age.
         */
        int totalGuests = ageRows.stream()
                .mapToInt(SmileBusinessInsightsRepository.AgeGroupRow::guests)
                .sum();

        int unknownAge = ageRows.stream()
                .filter(row -> "UNKNOWN".equals(row.ageGroup()))
                .mapToInt(SmileBusinessInsightsRepository.AgeGroupRow::guests)
                .sum();

        int knownAge = totalGuests - unknownAge;

        double ageCoveragePercent =
                percent(knownAge, totalGuests);

        List<CustomerDemographicsResponse.AgeGroup> ageGroups =
                ageRows.stream()
                        .map(row ->
                                new CustomerDemographicsResponse.AgeGroup(
                                        row.ageGroup(),
                                        row.guests(),
                                        percent(row.guests(), totalGuests)
                                )
                        )
                        .toList();

        List<CustomerDemographicsResponse.GenderGroup> gender =
                genderRows.stream()
                        .map(row ->
                                new CustomerDemographicsResponse.GenderGroup(
                                        row.gender(),
                                        row.guests(),
                                        percent(row.guests(), totalGuests)
                                )
                        )
                        .toList();

        List<CustomerDemographicsResponse.NationalityGroup> nationalities =
                nationalityRows.stream()
                        .map(row ->
                                new CustomerDemographicsResponse.NationalityGroup(
                                        row.nationality(),
                                        row.guests(),
                                        percent(row.guests(), totalGuests)
                                )
                        )
                        .toList();

        CustomerDemographicsResponse.DemographicCoverage coverage =
                new CustomerDemographicsResponse.DemographicCoverage(
                        knownAge,
                        unknownAge,
                        ageCoveragePercent
                );

        return new CustomerDemographicsResponse(
                businessDate,
                totalGuests,
                coverage,
                ageGroups,
                gender,
                nationalities
        );
    }

    private double percent(int value, int total) {

        if (total <= 0) {
            return 0.0;
        }

        return BigDecimal.valueOf(value)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(total),
                        2,
                        RoundingMode.HALF_UP
                )
                .doubleValue();
    }

    public CustomerMixResponse getCustomerMix(
            LocalDate businessDate
    ) {

        SmileBusinessInsightsRepository.CustomerMixRow onsenRow =
                repository.getHotelToOnsenMix(businessDate);

        int hotelGuests = onsenRow.hotelGuests();

        // =========================
        // Onsen
        // =========================

        int onsenUsedGuests = onsenRow.usedGuests();

        int onsenNotUsedGuests =
                Math.max(0, hotelGuests - onsenUsedGuests);

        CustomerMixResponse.ServiceUsage onsen =
                new CustomerMixResponse.ServiceUsage(
                        true,
                        onsenUsedGuests,
                        onsenNotUsedGuests,
                        percent(onsenUsedGuests, hotelGuests)
                );

        // =========================
        // Breakfast
        // =========================
        // File 16 sẽ nối dữ liệu thật từ repository.

// =========================
// Breakfast
// =========================

        SmileBusinessInsightsRepository.BreakfastMixRow breakfastRow =
                repository.getHotelToBreakfastMix(businessDate);

        CustomerMixResponse.BreakfastUsage breakfast;

        if (breakfastRow.sourceGuests() <= 0) {

            /*
             * Không có record Breakfast trong POS cho ngày này.
             * Không diễn giải thành 0% utilization.
             */
            breakfast =
                    new CustomerMixResponse.BreakfastUsage(
                            false,
                            null,
                            null,
                            null,
                            null
                    );

        } else {

            int breakfastEligibleGuests =
                    breakfastRow.eligibleGuests();

            int breakfastUsedGuests =
                    breakfastRow.usedGuests();

            int breakfastNotUsedGuests =
                    Math.max(
                            0,
                            breakfastEligibleGuests - breakfastUsedGuests
                    );

            breakfast =
                    new CustomerMixResponse.BreakfastUsage(
                            true,
                            breakfastEligibleGuests,
                            breakfastUsedGuests,
                            breakfastNotUsedGuests,
                            percent(
                                    breakfastUsedGuests,
                                    breakfastEligibleGuests
                            )
                    );
        }

        return new CustomerMixResponse(
                businessDate,
                hotelGuests,
                onsen,
                breakfast
        );
    }

    public RevenueMixResponse getRevenueMix(LocalDate businessDate) {

        List<SmileBusinessInsightsRepository.RevenueMixRow> rows =
                repository.getRevenueMix(businessDate);

        Map<String, BigDecimal> revenueByBusinessUnit =
                rows.stream()
                        .collect(Collectors.toMap(
                                SmileBusinessInsightsRepository.RevenueMixRow::businessUnit,
                                row -> row.revenue() != null
                                        ? row.revenue()
                                        : BigDecimal.ZERO,
                                BigDecimal::add
                        ));

        List<String> businessUnits = List.of(
                "HOTEL",
                "F&B",
                "ONSEN",
                "SPA",
                "OTHER"
        );

        BigDecimal totalRevenue =
                businessUnits.stream()
                        .map(unit ->
                                revenueByBusinessUnit.getOrDefault(
                                        unit,
                                        BigDecimal.ZERO
                                )
                        )
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        List<RevenueMixResponse.BusinessUnitRevenue> result =
                new ArrayList<>();

        for (String unit : businessUnits) {

            BigDecimal revenue =
                    revenueByBusinessUnit.getOrDefault(
                            unit,
                            BigDecimal.ZERO
                    );

            double contributionPercent = 0.0;

            if (totalRevenue.compareTo(BigDecimal.ZERO) != 0) {

                contributionPercent =
                        revenue
                                .multiply(BigDecimal.valueOf(100))
                                .divide(
                                        totalRevenue,
                                        2,
                                        RoundingMode.HALF_UP
                                )
                                .doubleValue();
            }

            result.add(
                    new RevenueMixResponse.BusinessUnitRevenue(
                            unit,
                            revenue,
                            contributionPercent
                    )
            );
        }

        return new RevenueMixResponse(
                businessDate,
                totalRevenue,
                result
        );
    }

    public RevenueTrendResponse getRevenueTrend(
            LocalDate toDate,
            int days
    ) {

        if (days < 1 || days > 90) {
            throw new IllegalArgumentException(
                    "days must be between 1 and 90"
            );
        }

        LocalDate fromDate =
                toDate.minusDays(days - 1L);

        List<SmileBusinessInsightsRepository.RevenueTrendRow> rows =
                repository.getRevenueTrend(
                        fromDate,
                        toDate
                );

        Map<LocalDate, BigDecimal> revenueByDate =
                rows.stream()
                        .collect(Collectors.toMap(
                                SmileBusinessInsightsRepository
                                        .RevenueTrendRow::date,
                                row -> row.revenue() != null
                                        ? row.revenue()
                                        : BigDecimal.ZERO,
                                BigDecimal::add
                        ));

        List<RevenueTrendResponse.RevenuePoint> data =
                new ArrayList<>();

        LocalDate currentDate = fromDate;

        while (!currentDate.isAfter(toDate)) {

            BigDecimal revenue =
                    revenueByDate.getOrDefault(
                            currentDate,
                            BigDecimal.ZERO
                    );

            data.add(
                    new RevenueTrendResponse.RevenuePoint(
                            currentDate,
                            revenue
                    )
            );

            currentDate = currentDate.plusDays(1);
        }

        return new RevenueTrendResponse(
                fromDate,
                toDate,
                data
        );
    }

}