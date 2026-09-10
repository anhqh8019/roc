package org.venusgiti.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.dto.HotelTrendResponse;
import org.venusgiti.repository.SmileRevenueRepository;
import org.venusgiti.repository.SmileRoomRepository;
import org.venusgiti.repository.SmileStayRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelTrendService {

    private final SmileRoomRepository roomRepository;
    private final SmileStayRepository stayRepository;
    private final SmileRevenueRepository revenueRepository;

    public List<HotelTrendResponse> getTrend(
            LocalDate from,
            LocalDate to
    ) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "'from' must be before or equal to 'to'"
            );
        }

        int totalRooms =
                roomRepository.countPhysicalRooms();

        List<SmileStayRepository.DailyOccupancy>
                occupancies =
                stayRepository.getDailyOccupancy(from, to);

        List<SmileRevenueRepository.DailyRevenue>
                revenues =
                revenueRepository.getDailyRevenue(from, to);

        Map<LocalDate,
                SmileStayRepository.DailyOccupancy>
                occupancyMap =
                occupancies.stream()
                        .collect(
                                Collectors.toMap(
                                        SmileStayRepository
                                                .DailyOccupancy
                                                ::businessDate,
                                        Function.identity()
                                )
                        );

        Map<LocalDate,
                SmileRevenueRepository.DailyRevenue>
                revenueMap =
                revenues.stream()
                        .collect(
                                Collectors.toMap(
                                        SmileRevenueRepository
                                                .DailyRevenue
                                                ::businessDate,
                                        Function.identity()
                                )
                        );

        List<HotelTrendResponse> result =
                new ArrayList<>();

        LocalDate current = from;

        while (!current.isAfter(to)) {

            int occupiedRooms =
                    occupancyMap.containsKey(current)
                            ? occupancyMap
                            .get(current)
                            .occupiedRooms()
                            : 0;

            BigDecimal roomNetRevenue =
                    revenueMap.containsKey(current)
                            ? revenueMap
                            .get(current)
                            .roomNetRevenue()
                            : BigDecimal.ZERO;

            BigDecimal totalNetRevenue =
                    revenueMap.containsKey(current)
                            ? revenueMap
                            .get(current)
                            .totalNetRevenue()
                            : BigDecimal.ZERO;

            BigDecimal occupancyPercent =
                    totalRooms > 0
                            ? BigDecimal
                            .valueOf(occupiedRooms)
                            .multiply(
                                    BigDecimal.valueOf(100)
                            )
                            .divide(
                                    BigDecimal.valueOf(
                                            totalRooms
                                    ),
                                    2,
                                    RoundingMode.HALF_UP
                            )
                            : BigDecimal.ZERO;

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

            result.add(
                    new HotelTrendResponse(
                            current,
                            occupiedRooms,
                            occupancyPercent,
                            roomNetRevenue,
                            totalNetRevenue,
                            adr,
                            revPar
                    )
            );

            current = current.plusDays(1);
        }

        return result;
    }
}