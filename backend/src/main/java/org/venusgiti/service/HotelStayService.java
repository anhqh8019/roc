package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.dto.*;
import org.venusgiti.repository.SmileStayRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HotelStayService {

    private final SmileStayRepository repository;

    public List<InHouseStayResponse> getInHouseStays() {
        return repository.getInHouseStays();
    }

    public ArrivalsResponse getArrivals(
            LocalDate businessDate
    ) {

        List<ArrivalItemResponse> arrivals =
                repository.getArrivals(businessDate);

        int expected = 0;
        int checkedIn = 0;
        int cancelled = 0;
        int noShow = 0;

        for (ArrivalItemResponse arrival : arrivals) {

            switch (arrival.status()) {

                case EXPECTED ->
                        expected++;

                case CHECKED_IN ->
                        checkedIn++;

                case CANCELLED ->
                        cancelled++;

                case NO_SHOW ->
                        noShow++;
            }
        }

        ArrivalSummary summary =
                new ArrivalSummary(
                        arrivals.size(),
                        expected,
                        checkedIn,
                        cancelled,
                        noShow
                );

        return new ArrivalsResponse(
                businessDate,
                summary,
                arrivals
        );
    }

    public DeparturesResponse getDepartures(
            LocalDate businessDate
    ) {

        List<DepartureItemResponse> departures =
                repository.getDepartures(
                        businessDate
                );

        int dueOut = 0;
        int checkedOut = 0;

        for (
                DepartureItemResponse departure
                : departures
        ) {
            switch (departure.status()) {
                case DUE_OUT ->
                        dueOut++;

                case CHECKED_OUT ->
                        checkedOut++;
            }
        }

        DepartureSummary summary =
                new DepartureSummary(
                        departures.size(),
                        dueOut,
                        checkedOut
                );

        return new DeparturesResponse(
                businessDate,
                summary,
                departures
        );
    }

    public BigDecimal getOccupancyPercent(
            LocalDate businessDate
    ) {
        int occupiedRooms =
                repository.countOccupiedRooms(
                        businessDate
                );

        int totalRooms = 84; // chỉ tạm thời để test

        if (totalRooms == 0) {
            return BigDecimal.ZERO;
        }

        return BigDecimal
                .valueOf(occupiedRooms)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(totalRooms),
                        2,
                        RoundingMode.HALF_UP
                );
    }

}