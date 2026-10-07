package org.venusgiti.onsen.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.venusgiti.integration.onsen.OnsenCurrentGuestResponse;
import org.venusgiti.integration.onsen.OnsenPackageSummaryResponse;
import org.venusgiti.integration.onsen.OnsenTrendResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/onsen")
@RequiredArgsConstructor
public class OnsenDashboardController {

    private final OnsenDashboardService service;

    @GetMapping("/dashboard")
    public OnsenDashboardResponse getDashboard(
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return service.getDashboard(date);
    }

    @GetMapping("/current-guests")
    public List<OnsenCurrentGuestResponse> getCurrentGuests(
            @RequestParam("date")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate businessDate
    ) {
        return service.getCurrentGuests(
                businessDate
        );
    }

    @GetMapping("/package-summary")
    public List<OnsenPackageSummaryResponse> getPackageSummary(
            @RequestParam("date")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate businessDate
    ) {
        return service.getPackageSummary(
                businessDate
        );
    }

    @GetMapping("/trend")
    public List<OnsenTrendResponse> getTrend(
            @RequestParam("date")
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate businessDate,

            @RequestParam(
                    value = "period",
                    defaultValue = "WEEK"
            )
            String period
    ) {

        return service.getGuestTrend(
                businessDate,
                period
        );
    }
}
