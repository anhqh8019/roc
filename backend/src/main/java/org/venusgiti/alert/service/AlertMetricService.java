package org.venusgiti.alert.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.alert.model.AlertMetric;
import org.venusgiti.service.HotelStayService;
import org.venusgiti.service.RoomService;
import org.venusgiti.util.HousekeepingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AlertMetricService {

    private final RoomService roomService;
    private final HotelStayService hotelStayService;

    public BigDecimal getValue(
            AlertMetric metric,
            LocalDate businessDate
    ) {

        return switch (metric) {

            case DIRTY_ROOMS ->
                    getDirtyRooms();

            case PENDING_ARRIVALS ->
                    getPendingArrivals(businessDate);

            case DUE_OUT_DEPARTURES ->
                    getDueOutDepartures(businessDate);

            case OCCUPANCY_PERCENT ->
                    getOccupancyPercent(businessDate);

            default ->
                    throw new IllegalArgumentException(
                            "Unsupported alert metric: " + metric
                    );
        };
    }

    /**
     * LIVE metric.
     *
     * Lấy trực tiếp trạng thái phòng hiện tại
     * giống Room Operations.
     */
    private BigDecimal getDirtyRooms() {

        long dirtyRooms =
                roomService
                        .getCurrentRooms()
                        .stream()
                        .filter(room ->
                                "DIRTY".equals(
                                        String.valueOf(
                                                room.housekeepingStatus()
                                        )
                                )
                        )
                        .count();

        System.out.println(
                "[ALERT METRIC] DIRTY_ROOMS = "
                        + dirtyRooms
        );

        return BigDecimal.valueOf(
                dirtyRooms
        );
    }

    /**
     * BUSINESS DATE metric.
     *
     * EXPECTED = booking dự kiến đến
     * nhưng chưa check-in / cancel / no-show.
     */
    private BigDecimal getPendingArrivals(
            LocalDate businessDate
    ) {

        var arrivals =
                hotelStayService.getArrivals(
                        businessDate
                );

        return BigDecimal.valueOf(
                arrivals.summary().expected()
        );
    }

    /**
     * BUSINESS DATE metric.
     *
     * DUE_OUT = DepartureDate = businessDate
     * và chưa có CheckOutTime.
     */
    private BigDecimal getDueOutDepartures(
            LocalDate businessDate
    ) {

        var departures =
                hotelStayService.getDepartures(
                        businessDate
                );

        return BigDecimal.valueOf(
                departures.summary().dueOut()
        );
    }

    /**
     * Chưa implement ở V1.
     *
     * Rule LOW_OCCUPANCY hiện đang disabled.
     */
    private BigDecimal getOccupancyPercent(
            LocalDate businessDate
    ) {
        return hotelStayService
                .getOccupancyPercent(
                        businessDate
                );
    }
}