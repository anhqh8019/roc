package org.venusgiti.service;

import org.springframework.stereotype.Service;
import org.venusgiti.dto.MonthlyOperationsReportResponse;
import org.venusgiti.repository.SmileMonthlyReportRepository;

@Service
public class MonthlyReportService {
    private final SmileMonthlyReportRepository repository;

    public MonthlyReportService(SmileMonthlyReportRepository repository) {
        this.repository = repository;
    }

    public MonthlyOperationsReportResponse getMonthlyReport(int year, int toMonth) {
        if (year < 2000 || year > 2100) throw new IllegalArgumentException("year must be between 2000 and 2100");
        if (toMonth < 1 || toMonth > 12) throw new IllegalArgumentException("toMonth must be between 1 and 12");

        var months = repository.getMonthlyReport(year, toMonth).stream()
                .map(r -> new MonthlyOperationsReportResponse.MonthlyRow(
                        r.month(), r.villaRevenue(), r.hotelRevenue(), r.onsenRevenue(), r.restaurantRevenue(),
                        r.villaRoomsSold(), r.hotelRoomsSold(), r.unallocatedRoomRevenue(),
                        r.totalRoomRevenue(), r.reconciliationDifference()
                )).toList();
        return new MonthlyOperationsReportResponse(year, toMonth, months);
    }
}
