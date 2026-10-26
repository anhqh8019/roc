package org.venusgiti.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.venusgiti.dto.MonthlyOperationsReportResponse;
import org.venusgiti.service.MonthlyReportService;

@RestController
@RequestMapping("/api/v1/reports")
public class ReportController {
    private final MonthlyReportService service;

    public ReportController(MonthlyReportService service) {
        this.service = service;
    }

    @GetMapping("/monthly-operations")
    public MonthlyOperationsReportResponse monthlyOperations(@RequestParam int year,
                                                             @RequestParam(defaultValue = "12") int toMonth) {
        try {
            return service.getMonthlyReport(year, toMonth);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
}
