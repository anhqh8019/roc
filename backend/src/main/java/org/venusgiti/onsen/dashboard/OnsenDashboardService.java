package org.venusgiti.onsen.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.integration.onsen.OnsenCurrentGuestResponse;
import org.venusgiti.integration.onsen.OnsenPackageSummaryResponse;
import org.venusgiti.integration.onsen.OnsenRepository;
import org.venusgiti.integration.onsen.OnsenTrendResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnsenDashboardService {

    private final OnsenRepository repository;

    public OnsenDashboardResponse getDashboard(
            LocalDate businessDate
    ) {
        var stats =
                repository.getDashboardStats(
                        businessDate
                );

        return new OnsenDashboardResponse(
                businessDate,
                stats.currentGuests(),
                stats.checkIns(),
                stats.checkOuts(),
                businessDate.equals(LocalDate.now())
        );
    }

    public List<OnsenCurrentGuestResponse> getCurrentGuests(
            LocalDate businessDate
    ) {
        return repository.findCurrentGuests(
                businessDate
        );
    }

    public List<OnsenPackageSummaryResponse> getPackageSummary(
            LocalDate businessDate
    ) {
        return repository.findPackageSummary(
                businessDate
        );
    }

    public List<OnsenTrendResponse> getGuestTrend(
            LocalDate businessDate,
            String period
    ) {

        LocalDate fromDate;

        switch (period.toUpperCase()) {

            case "MONTH" ->
                    fromDate =
                            businessDate.minusDays(29);

            case "THREE_MONTHS" ->
                    fromDate =
                            businessDate.minusDays(89);

            case "WEEK" ->
                    fromDate =
                            businessDate.minusDays(6);

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported period: " + period
                    );
        }

        List<OnsenTrendResponse> raw =
                repository.findGuestTrend(
                        fromDate,
                        businessDate
                );

        Map<LocalDate, Integer> byDate =
                raw.stream()
                        .collect(
                                Collectors.toMap(
                                        OnsenTrendResponse::date,
                                        OnsenTrendResponse::guests
                                )
                        );

        return fromDate
                .datesUntil(
                        businessDate.plusDays(1)
                )
                .map(date ->
                        new OnsenTrendResponse(
                                date,
                                byDate.getOrDefault(
                                        date,
                                        0
                                )
                        )
                )
                .toList();
    }
}
