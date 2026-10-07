package org.venusgiti.alert.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.alert.dto.AlertHistoryResponse;
import org.venusgiti.alert.dto.AlertUnreadCountResponse;
import org.venusgiti.alert.repository.AlertStateRepository;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AlertStateService {

    private final AlertStateRepository repository;

    public AlertUnreadCountResponse getUnreadCount(
            LocalDate businessDate
    ) {
        return new AlertUnreadCountResponse(
                repository.countUnread(businessDate)
        );
    }

    public void markRead(
            long id,
            String username
    ) {
        repository.markRead(
                id,
                username
        );
    }

    public AlertHistoryResponse getHistory(
            LocalDate from,
            LocalDate to,
            String module,
            String priority,
            String status,
            int page,
            int size
    ) {

        if (page < 0) {
            page = 0;
        }

        if (size < 1) {
            size = 20;
        }

        if (size > 100) {
            size = 100;
        }

        long totalElements = repository.countHistory(
                from,
                to,
                module,
                priority,
                status
        );

        int totalPages = totalElements == 0
                ? 0
                : (int) Math.ceil((double) totalElements / size);

        var alerts = repository.getHistory(
                from,
                to,
                module,
                priority,
                status,
                page,
                size
        );

        return new AlertHistoryResponse(
                page,
                size,
                totalElements,
                totalPages,
                alerts
        );
    }

    public int deleteHistory(
            LocalDate from,
            LocalDate to
    ) {

        if (from == null && to == null) {
            throw new IllegalArgumentException(
                    "Phải cung cấp from hoặc to khi xóa lịch sử cảnh báo"
            );
        }

        if (from != null
                && to != null
                && from.isAfter(to)) {

            throw new IllegalArgumentException(
                    "from không được lớn hơn to"
            );
        }

        return repository.deleteHistory(
                from,
                to
        );
    }
}
