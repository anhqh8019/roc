package org.venusgiti.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.venusgiti.dto.ArrivalsResponse;
import org.venusgiti.dto.DeparturesResponse;
import org.venusgiti.dto.InHouseStayResponse;
import org.venusgiti.service.HotelStayService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hotel/stays")
@RequiredArgsConstructor
public class HotelStayController {

    private final HotelStayService service;

    @GetMapping("/in-house")
    public List<InHouseStayResponse> getInHouseStays() {
        return service.getInHouseStays();
    }

    @GetMapping("/arrivals")
    public ArrivalsResponse getArrivals(
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return service.getArrivals(date);
    }

    @GetMapping("/departures")
    public DeparturesResponse getDepartures(
            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE
            )
            LocalDate date
    ) {
        return service.getDepartures(date);
    }
}