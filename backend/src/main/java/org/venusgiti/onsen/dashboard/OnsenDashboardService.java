package org.venusgiti.onsen.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.integration.onsen.OnsenRepository;

import java.time.LocalDate;

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
}
