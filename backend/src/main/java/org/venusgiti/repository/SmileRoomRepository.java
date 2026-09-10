package org.venusgiti.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Map;

@Repository
@RequiredArgsConstructor
public class SmileRoomRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public int countPhysicalRooms() {

        String sql = """
            SELECT COUNT(*)
            FROM Room r
            INNER JOIN RoomType rt
                ON rt.RoomTypeCode = r.RoomTypeCode
               AND rt.HotelID = r.HotelID
            WHERE rt.NumRoom > 0
            """;

        Integer value = jdbc.queryForObject(
                sql,
                Map.of(),
                Integer.class
        );

        return value == null ? 0 : value;
    }
}