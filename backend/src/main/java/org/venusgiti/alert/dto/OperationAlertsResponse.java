package org.venusgiti.alert.dto;

import java.time.LocalDate;
import java.util.List;

public record OperationAlertsResponse(

        LocalDate businessDate,

        int total,

        List<OperationAlertResponse> alerts

) {
}