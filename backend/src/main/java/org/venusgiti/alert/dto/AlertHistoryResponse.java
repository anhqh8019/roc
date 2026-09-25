package org.venusgiti.alert.dto;

import java.util.List;

public record AlertHistoryResponse(
        int page,
        int size,
        long totalElements,
        int totalPages,
        List<AlertHistoryItem> alerts
) {
}
