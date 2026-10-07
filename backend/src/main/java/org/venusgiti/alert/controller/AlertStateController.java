package org.venusgiti.alert.controller;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.venusgiti.alert.dto.AlertHistoryResponse;
import org.venusgiti.alert.dto.AlertUnreadCountResponse;
import org.venusgiti.alert.service.AlertStateService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertStateController {

    private final AlertStateService service;

    @GetMapping("/unread-count")
    public AlertUnreadCountResponse getUnreadCount(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return service.getUnreadCount(date);
    }

    @PatchMapping("/{id}/read")
    public void markRead(
            @PathVariable long id,
            Authentication authentication
    ) {

        String username =
                authentication != null
                        ? authentication.getName()
                        : "SYSTEM";

        service.markRead(
                id,
                username
        );
    }

    @GetMapping("/history")
    public AlertHistoryResponse getHistory(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to,

            @RequestParam(required = false)
            String module,

            @RequestParam(required = false)
            String priority,

            @RequestParam(required = false)
            String status,

            @RequestParam(defaultValue = "0")
            int page,

            @RequestParam(defaultValue = "20")
            int size
    ) {
        return service.getHistory(
                from,
                to,
                module,
                priority,
                status,
                page,
                size
        );
    }

    @DeleteMapping("/history")
    public Map<String, Integer> deleteHistory(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate from,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate to
    ) {

        int deleted = service.deleteHistory(
                from,
                to
        );

        return Map.of(
                "deleted",
                deleted
        );
    }
}