package org.venusgiti.alert.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.venusgiti.alert.dto.AlertRuleResponse;
import org.venusgiti.alert.dto.OperationAlertResponse;
import org.venusgiti.alert.dto.OperationAlertsResponse;
import org.venusgiti.alert.model.AlertMetric;
import org.venusgiti.alert.model.AlertOperator;
import org.venusgiti.alert.repository.AlertStateRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OperationAlertService {

    private final AlertRuleService alertRuleService;
    private final AlertMetricService alertMetricService;

    // MỚI
    private final AlertStateRepository alertStateRepository;


    public OperationAlertsResponse getOperationAlerts(
            LocalDate businessDate
    ) {

        List<AlertRuleResponse> rules =
                alertRuleService.findEnabled();

        List<OperationAlertResponse> alerts =
                new ArrayList<>();

        for (AlertRuleResponse rule : rules) {

            // 1. Kiểm tra khung giờ hoạt động
            if (!isActiveNow(rule)) {
                continue;
            }

            // 2. Lấy giá trị metric thực tế
            BigDecimal actualValue =
                    alertMetricService.getValue(
                            rule.metric(),
                            businessDate
                    );

            // 3. Evaluate rule
            boolean triggered =
                    evaluate(
                            actualValue,
                            rule.operator(),
                            rule.thresholdValue()
                    );

            if (!triggered) {
                continue;
            }

            // 4. Xác định đây là LIVE hay Business Date
            boolean live =
                    rule.metric()
                            == AlertMetric.DIRTY_ROOMS;

            // 5. Sinh unique key cho alert
            String alertKey =
                    buildAlertKey(
                            rule,
                            businessDate,
                            live
                    );

            // 6. Lưu/update AlertState
            long stateId =
                    alertStateRepository.upsert(
                            alertKey,
                            rule.id(),
                            rule.ruleCode(),
                            live ? null : businessDate
                    );

            // 7. Build message
            String message =
                    buildMessage(
                            rule.messageTemplate(),
                            actualValue
                    );

            // 8. Trả alert ra API
            alerts.add(
                    new OperationAlertResponse(
                            stateId,
                            rule.id(),
                            rule.ruleCode(),
                            rule.metric(),
                            rule.priority(),
                            rule.module(),
                            rule.ruleName(),
                            message,
                            actualValue,
                            rule.thresholdValue(),
                            rule.actionUrl(),
                            live
                    )
            );
        }

        return new OperationAlertsResponse(
                businessDate,
                alerts.size(),
                alerts
        );
    }


    /**
     * Tạo identity cho một alert instance.
     *
     * LIVE:
     * HOUSEKEEPING_DIRTY:LIVE
     *
     * Business Date:
     * LOW_OCCUPANCY:2026-09-24
     */
    private String buildAlertKey(
            AlertRuleResponse rule,
            LocalDate businessDate,
            boolean live
    ) {

        if (live) {
            return rule.ruleCode() + ":LIVE";
        }

        return rule.ruleCode()
                + ":"
                + businessDate;
    }


    /**
     * Kiểm tra rule có đang nằm trong
     * khung giờ hoạt động hay không.
     */
    private boolean isActiveNow(
            AlertRuleResponse rule
    ) {

        LocalTime now = LocalTime.now();

        LocalTime from = rule.activeFrom();
        LocalTime until = rule.activeUntil();

        if (from == null && until == null) {
            return true;
        }

        if (from != null && now.isBefore(from)) {
            return false;
        }

        if (until != null && now.isAfter(until)) {
            return false;
        }

        return true;
    }


    /**
     * Evaluate operator của rule.
     */
    private boolean evaluate(
            BigDecimal actual,
            AlertOperator operator,
            BigDecimal threshold
    ) {

        int compare =
                actual.compareTo(threshold);

        return switch (operator) {

            case GT ->
                    compare > 0;

            case GTE ->
                    compare >= 0;

            case LT ->
                    compare < 0;

            case LTE ->
                    compare <= 0;

            case EQ ->
                    compare == 0;
        };
    }


    /**
     * Replace {value} trong message template.
     */
    private String buildMessage(
            String template,
            BigDecimal actualValue
    ) {

        if (template == null
                || template.isBlank()) {

            return "Giá trị hiện tại: "
                    + formatValue(actualValue);
        }

        return template.replace(
                "{value}",
                formatValue(actualValue)
        );
    }


    /**
     * 2.0000 -> 2
     * 0.00   -> 0
     * 23.50  -> 23.5
     */
    private String formatValue(
            BigDecimal value
    ) {

        if (value == null) {
            return "0";
        }

        return value
                .stripTrailingZeros()
                .toPlainString();
    }
}