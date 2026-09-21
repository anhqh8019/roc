package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.dto.*;
import org.venusgiti.repository.SmileStayRepository;

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

}