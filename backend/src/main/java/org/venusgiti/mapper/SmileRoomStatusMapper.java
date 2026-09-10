package org.venusgiti.mapper;

import org.springframework.stereotype.Component;
import org.venusgiti.util.HousekeepingStatus;
import org.venusgiti.util.OccupancyStatus;

@Component
public class SmileRoomStatusMapper {

    public OccupancyStatus occupancy(Integer hskpOccupied) {
        return Integer.valueOf(1).equals(hskpOccupied)
                ? OccupancyStatus.OCCUPIED
                : OccupancyStatus.VACANT;
    }

    public HousekeepingStatus housekeeping(
            Integer hskpClean,
            Integer inspected) {

        if (Integer.valueOf(1).equals(inspected)) {
            return HousekeepingStatus.INSPECTED;
        }

        if (Integer.valueOf(1).equals(hskpClean)) {
            return HousekeepingStatus.CLEAN;
        }

        return HousekeepingStatus.DIRTY;
    }
}