package org.venusgiti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.venusgiti.dto.HotelDashboardResponse;
import org.venusgiti.dto.HotelTrendResponse;
import org.venusgiti.service.HotelDashboardService;
import org.venusgiti.service.HotelTrendService;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hotel")
@RequiredArgsConstructor
public class HotelDashboardController {

    private final HotelDashboardService service;
    private final HotelTrendService hotelTrendService;

    @GetMapping("/dashboard")
    public HotelDashboardResponse dashboard(
            @RequestParam LocalDate date
    ) {
        return service.getDashboard(date);
    }

    @GetMapping("/dashboard/trend")
    public List<HotelTrendResponse> getTrend(
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        if (to.isBefore(from)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "to must be greater than or equal to from"
            );
        }

        long days = ChronoUnit.DAYS.between(from, to) + 1;
        if (days > 365) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "hotel performance range must not exceed 365 days"
            );
        }

        return hotelTrendService.getTrend(from, to);
    }
}
