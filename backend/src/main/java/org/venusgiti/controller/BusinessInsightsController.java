package org.venusgiti.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.venusgiti.dto.CustomerDemographicsResponse;
import org.venusgiti.dto.RevenueMixResponse;
import org.venusgiti.dto.RevenueTrendResponse;
import org.venusgiti.service.BusinessInsightsService;
import org.venusgiti.dto.CustomerMixResponse;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/business-insights")
public class BusinessInsightsController {

    private final BusinessInsightsService businessInsightsService;

    public BusinessInsightsController(
            BusinessInsightsService businessInsightsService
    ) {
        this.businessInsightsService = businessInsightsService;
    }

    @GetMapping("/customer-demographics")
    public CustomerDemographicsResponse getCustomerDemographics(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return businessInsightsService.getCustomerDemographics(date);
    }

    @GetMapping("/customer-mix")
    public CustomerMixResponse getCustomerMix(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return businessInsightsService.getCustomerMix(date);
    }

    @GetMapping("/revenue-mix")
    public RevenueMixResponse getRevenueMix(
            @RequestParam LocalDate date
    ) {
        return businessInsightsService.getRevenueMix(date);
    }

    @GetMapping("/revenue-trend")
    public RevenueTrendResponse getRevenueTrend(
            @RequestParam LocalDate date,
            @RequestParam(defaultValue = "7") int days
    ) {
        if (days < 1 || days > 90) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "days must be between 1 and 90"
            );
        }

        return businessInsightsService.getRevenueTrend(date, days);
    }
}