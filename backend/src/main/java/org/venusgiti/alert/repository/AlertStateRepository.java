package org.venusgiti.alert.repository;


import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.venusgiti.alert.dto.AlertHistoryItem;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Repository
public class AlertStateRepository {


    private final NamedParameterJdbcTemplate jdbc;

    public AlertStateRepository(
            @Qualifier("rocNamedParameterJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public long upsert(
            String alertKey,
            long ruleId,
            String ruleCode,
            LocalDate businessDate
    ) {

        String upsertSql = """
        IF EXISTS (
            SELECT 1
            FROM AlertState
            WHERE AlertKey = :alertKey
        )
        BEGIN
            UPDATE AlertState
            SET LastSeenAt = SYSDATETIME()
            WHERE AlertKey = :alertKey
        END
        ELSE
        BEGIN
            INSERT INTO AlertState
            (
                AlertKey,
                RuleId,
                RuleCode,
                BusinessDate,
                Status
            )
            VALUES
            (
                :alertKey,
                :ruleId,
                :ruleCode,
                :businessDate,
                'UNREAD'
            )
        END
        """;

        var params =
                new MapSqlParameterSource()
                        .addValue("alertKey", alertKey)
                        .addValue("ruleId", ruleId)
                        .addValue("ruleCode", ruleCode)
                        .addValue("businessDate", businessDate);

        // INSERT hoặc UPDATE
        jdbc.update(
                upsertSql,
                params
        );

        // Sau đó query Id riêng
        String selectIdSql = """
        SELECT Id
        FROM AlertState
        WHERE AlertKey = :alertKey
        """;

        Long id =
                jdbc.queryForObject(
                        selectIdSql,
                        params,
                        Long.class
                );

        if (id == null) {
            throw new IllegalStateException(
                    "Cannot resolve AlertState Id for "
                            + alertKey
            );
        }

        return id;
    }

    public int countUnread() {

        String sql = """
            SELECT COUNT(*)
            FROM AlertState
            WHERE Status = 'UNREAD'
            """;

        Integer result =
                jdbc.queryForObject(
                        sql,
                        Map.of(),
                        Integer.class
                );

        return result != null ? result : 0;
    }

    public void markRead(
            long id,
            String username
    ) {

        String sql = """
            UPDATE AlertState
            SET
                Status = 'READ',
                ReadAt = SYSDATETIME(),
                ReadBy = :username
            WHERE Id = :id
              AND Status = 'UNREAD'
            """;

        jdbc.update(
                sql,
                Map.of(
                        "id", id,
                        "username", username
                )
        );
    }


    public List<AlertHistoryItem> getHistory(
            LocalDate from,
            LocalDate to,
            String module,
            String priority,
            String status,
            int page,
            int size
    ) {

        StringBuilder sql = new StringBuilder("""
        SELECT
            s.Id AS StateId,
            s.RuleCode,
            r.RuleName,
            r.Module,
            r.Priority,
            s.BusinessDate,
            s.Status,
            s.FirstSeenAt,
            s.LastSeenAt,
            s.ReadAt,
            s.ReadBy
        FROM AlertState s
        INNER JOIN AlertRule r
            ON r.RuleCode = s.RuleCode
        WHERE 1 = 1
        """);

        MapSqlParameterSource params = new MapSqlParameterSource();
        appendHistoryFilters(sql, params, from, to, module, priority, status);

        sql.append("""
         ORDER BY
            s.LastSeenAt DESC,
            s.Id DESC
         OFFSET :offset ROWS
         FETCH NEXT :size ROWS ONLY
        """);

        params.addValue("offset", page * size);
        params.addValue("size", size);

        return jdbc.query(
                sql.toString(),
                params,
                (rs, rowNum) ->
                        new AlertHistoryItem(
                                rs.getLong("StateId"),
                                rs.getString("RuleCode"),
                                rs.getString("RuleName"),
                                rs.getString("Module"),
                                rs.getString("Priority"),
                                rs.getDate("BusinessDate") != null
                                        ? rs.getDate("BusinessDate").toLocalDate()
                                        : null,
                                rs.getString("Status"),
                                rs.getTimestamp("FirstSeenAt") != null
                                        ? rs.getTimestamp("FirstSeenAt").toLocalDateTime()
                                        : null,
                                rs.getTimestamp("LastSeenAt") != null
                                        ? rs.getTimestamp("LastSeenAt").toLocalDateTime()
                                        : null,
                                rs.getTimestamp("ReadAt") != null
                                        ? rs.getTimestamp("ReadAt").toLocalDateTime()
                                        : null,
                                rs.getString("ReadBy")
                        )
        );
    }

    public long countHistory(
            LocalDate from,
            LocalDate to,
            String module,
            String priority,
            String status
    ) {

        StringBuilder sql = new StringBuilder("""
        SELECT COUNT(*)
        FROM AlertState s
        INNER JOIN AlertRule r
            ON r.RuleCode = s.RuleCode
        WHERE 1 = 1
        """);

        MapSqlParameterSource params = new MapSqlParameterSource();
        appendHistoryFilters(sql, params, from, to, module, priority, status);

        Long result = jdbc.queryForObject(
                sql.toString(),
                params,
                Long.class
        );

        return result != null ? result : 0L;
    }

    private void appendHistoryFilters(
            StringBuilder sql,
            MapSqlParameterSource params,
            LocalDate from,
            LocalDate to,
            String module,
            String priority,
            String status
    ) {

        if (from != null) {
            sql.append("""
             AND (
                    s.BusinessDate >= :fromDate
                    OR (
                        s.BusinessDate IS NULL
                        AND CAST(s.FirstSeenAt AS date) >= :fromDate
                    )
                 )
            """);
            params.addValue("fromDate", from);
        }

        if (to != null) {
            sql.append("""
             AND (
                    s.BusinessDate <= :toDate
                    OR (
                        s.BusinessDate IS NULL
                        AND CAST(s.FirstSeenAt AS date) <= :toDate
                    )
                 )
            """);
            params.addValue("toDate", to);
        }

        if (module != null && !module.isBlank()) {
            sql.append("""
             AND r.Module = :module
            """);
            params.addValue("module", module.trim().toUpperCase());
        }

        if (priority != null && !priority.isBlank()) {
            sql.append("""
             AND r.Priority = :priority
            """);
            params.addValue("priority", priority.trim().toUpperCase());
        }

        if (status != null && !status.isBlank()) {
            sql.append("""
             AND s.Status = :status
            """);
            params.addValue("status", status.trim().toUpperCase());
        }
    }
}
