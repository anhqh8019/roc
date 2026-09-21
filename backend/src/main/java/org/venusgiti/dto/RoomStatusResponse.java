package org.venusgiti.dto;

import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

public record RoomStatusResponse(
        String roomCode,
        String roomType,
        String roomTypeName,
        String zone,
        OccupancyStatus occupancyStatus,
        HousekeepingStatus housekeepingStatus,
        boolean inspected
) {
}