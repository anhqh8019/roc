package org.venusgiti.alert.dto;

import org.venusgiti.alert.model.AlertMetric;
import org.venusgiti.alert.model.AlertPriority;

import java.math.BigDecimal;

public record OperationAlertResponse(
        long stateId,
        long ruleId,
        String ruleCode,
        AlertMetric metric,
        AlertPriority priority,
        String category,
        String title,
        String message,
        BigDecimal actualValue,
        BigDecimal thresholdValue,
        String actionUrl,
        boolean live
) {
}