package org.venusgiti.dto;

import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

public record RoomStatusResponse(
        String roomCode,
        String roomType,
        String floor,
        OccupancyStatus occupancyStatus,
        HousekeepingStatus housekeepingStatus,
        boolean inspected
) {}