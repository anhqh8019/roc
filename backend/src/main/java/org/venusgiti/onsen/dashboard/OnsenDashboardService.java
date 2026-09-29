package org.venusgiti.onsen.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.integration.onsen.OnsenCurrentGuestResponse;
import org.venusgiti.integration.onsen.OnsenPackageSummaryResponse;
import org.venusgiti.integration.onsen.OnsenRepository;

import java.time.LocalDate;
import java.util.List;

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
}
