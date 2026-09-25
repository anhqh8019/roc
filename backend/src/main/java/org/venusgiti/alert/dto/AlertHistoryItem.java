package org.venusgiti.alert.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AlertHistoryItem(
        long stateId,
        String ruleCode,
        String ruleName,
        String module,
        String priority,
        LocalDate businessDate,
        String status,
        LocalDateTime firstSeenAt,
        LocalDateTime lastSeenAt,
        LocalDateTime readAt,
        String readBy
) {
}