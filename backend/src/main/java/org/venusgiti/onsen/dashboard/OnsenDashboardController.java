package org.venusgiti.onsen.dashboard;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

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
}
