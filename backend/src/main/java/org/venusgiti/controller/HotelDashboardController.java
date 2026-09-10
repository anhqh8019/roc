package org.venusgiti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.venusgiti.dto.HotelDashboardResponse;
import org.venusgiti.dto.HotelTrendResponse;
import org.venusgiti.service.HotelDashboardService;
import org.venusgiti.service.HotelTrendService;

import java.time.LocalDate;
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
        return hotelTrendService.getTrend(
                from,
                to
        );
    }
}