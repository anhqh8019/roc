package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.dto.HotelDashboardResponse;
import org.venusgiti.repository.SmileHousekeepingRepository;
import org.venusgiti.repository.SmileRevenueRepository;
import org.venusgiti.repository.SmileRoomRepository;
import org.venusgiti.repository.SmileStayRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HotelDashboardService {

    private final SmileRoomRepository roomRepository;
    private final SmileStayRepository stayRepository;
    private final SmileRevenueRepository revenueRepository;
    private final SmileHousekeepingRepository housekeepingRepository;

    public HotelDashboardResponse getDashboard(LocalDate date) {

        long totalStart = System.currentTimeMillis();

        // =========================
        // 1. INVENTORY
        // =========================

        long start = System.currentTimeMillis();

        int totalRooms =
                roomRepository.countPhysicalRooms();

        logTime(
                "countPhysicalRooms",
                start
        );


        start = System.currentTimeMillis();

        int occupiedRooms =
                stayRepository.countOccupiedRooms(date);

        logTime(
                "countOccupiedRooms",
                start
        );


        int availableRooms =
                Math.max(
                        totalRooms - occupiedRooms,
                        0
                );

        int outOfOrderRooms = 0;
        // TODO: decode OOO/OOI sau


        BigDecimal occupancyPercent =
                totalRooms > 0
                        ? BigDecimal
                        .valueOf(occupiedRooms)
                        .multiply(
                                BigDecimal.valueOf(100)
                        )
                        .divide(
                                BigDecimal.valueOf(totalRooms),
                                2,
                                RoundingMode.HALF_UP
                        )
                        : BigDecimal.ZERO;


        // =========================
        // 2. GUEST FLOW
        // =========================

        start = System.currentTimeMillis();

        int arrivals =
                stayRepository.countArrivals(date);

        logTime(
                "countArrivals",
                start
        );


        start = System.currentTimeMillis();

        int departures =
                stayRepository.countDepartures(date);

        logTime(
                "countDepartures",
                start
        );


        start = System.currentTimeMillis();

        SmileStayRepository.GuestCount guestCount =
                stayRepository.getGuestCount(date);

        logTime(
                "getGuestCount",
                start
        );


        // =========================
        // 3. REVENUE
        // =========================

        start = System.currentTimeMillis();

        SmileRevenueRepository.RevenueSummary revenue =
                revenueRepository.getRevenue(date);

        logTime(
                "getRevenue",
                start
        );


        BigDecimal roomNetRevenue =
                revenue.roomNetRevenue();


        BigDecimal adr =
                occupiedRooms > 0
                        ? roomNetRevenue.divide(
                        BigDecimal.valueOf(
                                occupiedRooms
                        ),
                        2,
                        RoundingMode.HALF_UP
                )
                        : BigDecimal.ZERO;


        BigDecimal revPar =
                totalRooms > 0
                        ? roomNetRevenue.divide(
                        BigDecimal.valueOf(
                                totalRooms
                        ),
                        2,
                        RoundingMode.HALF_UP
                )
                        : BigDecimal.ZERO;


        // =========================
        // 4. HOUSEKEEPING
        // =========================

        start = System.currentTimeMillis();

        SmileHousekeepingRepository.HousekeepingSummary housekeeping =
                housekeepingRepository.getCurrentSummary();

        logTime(
                "getHousekeeping",
                start
        );


        // =========================
        // TOTAL TIME
        // =========================

        System.out.println(
                "======================================"
        );

        System.out.println(
                "TOTAL DASHBOARD = "
                        + (System.currentTimeMillis()
                        - totalStart)
                        + " ms"
        );

        System.out.println(
                "======================================"
        );


        // =========================
        // 5. RESPONSE
        // =========================

        return new HotelDashboardResponse(

                date,

                new HotelDashboardResponse.Inventory(
                        totalRooms,
                        occupiedRooms,
                        availableRooms,
                        outOfOrderRooms,
                        occupancyPercent
                ),

                new HotelDashboardResponse.GuestFlow(
                        arrivals,
                        departures,
                        occupiedRooms,
                        guestCount.adults(),
                        guestCount.children()
                ),

                new HotelDashboardResponse.Revenue(
                        revenue.roomGrossRevenue(),
                        revenue.roomNetRevenue(),

                        revenue.foodBeverageRevenue(),
                        revenue.onsenRevenue(),
                        revenue.otherRevenue(),

                        revenue.totalGrossRevenue(),
                        revenue.totalNetRevenue(),

                        revenue.serviceCharge(),
                        revenue.tax(),

                        adr,
                        revPar
                ),

                new HotelDashboardResponse.Housekeeping(
                        housekeeping.clean(),
                        housekeeping.dirty(),
                        housekeeping.inspected(),
                        true
                )
        );
    }


    private void logTime(
            String name,
            long start
    ) {

        long duration =
                System.currentTimeMillis()
                        - start;

        System.out.println(
                name
                        + " = "
                        + duration
                        + " ms"
        );
    }
}