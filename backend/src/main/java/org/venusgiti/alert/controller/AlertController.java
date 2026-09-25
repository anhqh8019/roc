package org.venusgiti.alert.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.venusgiti.alert.dto.OperationAlertsResponse;
import org.venusgiti.alert.service.OperationAlertService;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final OperationAlertService operationAlertService;

    @GetMapping("/operations")
    public OperationAlertsResponse getOperationAlerts(
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate businessDate
    ) {

        return operationAlertService
                .getOperationAlerts(businessDate);
    }
}