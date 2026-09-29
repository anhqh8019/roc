package org.venusgiti.integration.onsen;

public record OnsenPackageSummaryResponse(
        String packageCode,
        String packageName,
        String transactionSubCode,
        int guests,
        int checkIns,
        int checkOuts
) {
}