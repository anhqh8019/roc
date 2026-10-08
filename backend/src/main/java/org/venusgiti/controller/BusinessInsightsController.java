package org.venusgiti.controller;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.venusgiti.dto.*;
import org.venusgiti.service.BusinessInsightsService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/business-insights")
public class BusinessInsightsController {
    private final BusinessInsightsService businessInsightsService;

    public BusinessInsightsController(BusinessInsightsService businessInsightsService) {
        this.businessInsightsService=businessInsightsService;
    }

    @GetMapping("/customer-demographics")
    public CustomerDemographicsResponse getCustomerDemographics(@RequestParam("date") @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date){
        return businessInsightsService.getCustomerDemographics(date);
    }

    @GetMapping("/customer-mix")
    public CustomerMixResponse getCustomerMix(@RequestParam("date") @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date){
        return businessInsightsService.getCustomerMix(date);
    }

    @GetMapping("/revenue-mix")
    public RevenueMixResponse getRevenueMix(@RequestParam LocalDate date){
        return businessInsightsService.getRevenueMix(date);
    }

    @GetMapping("/revenue-trend")
    public RevenueTrendResponse getRevenueTrend(@RequestParam LocalDate date,@RequestParam(defaultValue="7") int days){
        validateDays(days);
        return businessInsightsService.getRevenueTrend(date,days);
    }

    @GetMapping("/customer-trend")
    public CustomerTrendResponse getCustomerTrend(@RequestParam LocalDate date,@RequestParam(defaultValue="7") int days){
        validateDays(days);
        return businessInsightsService.getCustomerTrend(date,days);
    }

    @GetMapping("/revenue-unit-trend")
    public RevenueUnitTrendResponse getRevenueUnitTrend(@RequestParam LocalDate date,@RequestParam(defaultValue="7") int days){
        validateDays(days);
        return businessInsightsService.getRevenueUnitTrend(date,days);
    }

    private void validateDays(int days){
        if(days<1||days>90){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"days must be between 1 and 90");
        }
    }
}
