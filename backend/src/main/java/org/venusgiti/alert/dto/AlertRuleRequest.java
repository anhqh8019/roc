package org.venusgiti.alert.dto;

import org.venusgiti.alert.model.AlertMetric;
import org.venusgiti.alert.model.AlertOperator;
import org.venusgiti.alert.model.AlertPriority;

import java.math.BigDecimal;
import java.time.LocalTime;

public record AlertRuleRequest(

        String ruleCode,
        String ruleName,

        String module,

        AlertMetric metric,

        AlertOperator operator,

        BigDecimal thresholdValue,

        AlertPriority priority,

        String messageTemplate,

        String actionUrl,

        LocalTime activeFrom,
        LocalTime activeUntil,

        boolean enabled

) {
}