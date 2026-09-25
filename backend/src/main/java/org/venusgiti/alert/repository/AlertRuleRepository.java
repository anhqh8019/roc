package org.venusgiti.alert.repository;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.venusgiti.alert.dto.AlertRuleRequest;
import org.venusgiti.alert.dto.AlertRuleResponse;
import org.venusgiti.alert.model.AlertMetric;
import org.venusgiti.alert.model.AlertOperator;
import org.venusgiti.alert.model.AlertPriority;

import java.sql.Time;
import java.util.List;
import java.util.Map;

@Repository
public class AlertRuleRepository {

    private final NamedParameterJdbcTemplate jdbc;

    public AlertRuleRepository(
            @Qualifier("rocNamedParameterJdbcTemplate")
            NamedParameterJdbcTemplate jdbc
    ) {
        this.jdbc = jdbc;
    }

    public List<AlertRuleResponse> findAll() {

        String sql = """
            SELECT
                Id,
                RuleCode,
                RuleName,
                Module,
                Metric,
                Operator,
                ThresholdValue,
                Priority,
                MessageTemplate,
                ActionUrl,
                ActiveFrom,
                ActiveUntil,
                Enabled
            FROM AlertRule
            ORDER BY
                Enabled DESC,
                Priority,
                RuleName
            """;

        return jdbc.query(
                sql,
                Map.of(),
                (rs, rowNum) ->
                        new AlertRuleResponse(
                                rs.getLong("Id"),
                                rs.getString("RuleCode"),
                                rs.getString("RuleName"),
                                rs.getString("Module"),

                                AlertMetric.valueOf(
                                        rs.getString("Metric")
                                ),

                                AlertOperator.valueOf(
                                        rs.getString("Operator")
                                ),

                                rs.getBigDecimal(
                                        "ThresholdValue"
                                ),

                                AlertPriority.valueOf(
                                        rs.getString("Priority")
                                ),

                                rs.getString(
                                        "MessageTemplate"
                                ),

                                rs.getString(
                                        "ActionUrl"
                                ),

                                rs.getTime("ActiveFrom") != null
                                        ? rs.getTime("ActiveFrom")
                                        .toLocalTime()
                                        : null,

                                rs.getTime("ActiveUntil") != null
                                        ? rs.getTime("ActiveUntil")
                                        .toLocalTime()
                                        : null,

                                rs.getBoolean("Enabled")
                        )
        );
    }

    public List<AlertRuleResponse> findEnabled() {

        return findAll()
                .stream()
                .filter(AlertRuleResponse::enabled)
                .toList();
    }

    public long create(
            AlertRuleRequest request
    ) {

        String sql = """
            INSERT INTO AlertRule
            (
                RuleCode,
                RuleName,
                Module,
                Metric,
                Operator,
                ThresholdValue,
                Priority,
                MessageTemplate,
                ActionUrl,
                ActiveFrom,
                ActiveUntil,
                Enabled
            )
            VALUES
            (
                :ruleCode,
                :ruleName,
                :module,
                :metric,
                :operator,
                :thresholdValue,
                :priority,
                :messageTemplate,
                :actionUrl,
                :activeFrom,
                :activeUntil,
                :enabled
            )
            """;

        Map<String, Object> params =
                Map.ofEntries(
                        Map.entry(
                                "ruleCode",
                                request.ruleCode()
                        ),
                        Map.entry(
                                "ruleName",
                                request.ruleName()
                        ),
                        Map.entry(
                                "module",
                                request.module()
                        ),
                        Map.entry(
                                "metric",
                                request.metric().name()
                        ),
                        Map.entry(
                                "operator",
                                request.operator().name()
                        ),
                        Map.entry(
                                "thresholdValue",
                                request.thresholdValue()
                        ),
                        Map.entry(
                                "priority",
                                request.priority().name()
                        ),
                        Map.entry(
                                "messageTemplate",
                                request.messageTemplate() != null
                                        ? request.messageTemplate()
                                        : ""
                        ),
                        Map.entry(
                                "actionUrl",
                                request.actionUrl() != null
                                        ? request.actionUrl()
                                        : ""
                        ),
                        Map.entry(
                                "activeFrom",
                                request.activeFrom() != null
                                        ? Time.valueOf(
                                        request.activeFrom()
                                )
                                        : Time.valueOf("00:00:00")
                        ),
                        Map.entry(
                                "activeUntil",
                                request.activeUntil() != null
                                        ? Time.valueOf(
                                        request.activeUntil()
                                )
                                        : Time.valueOf("23:59:59")
                        ),
                        Map.entry(
                                "enabled",
                                request.enabled()
                        )
                );

        KeyHolder keyHolder =
                new GeneratedKeyHolder();

        jdbc.update(
                sql,
                new org.springframework.jdbc.core.namedparam.MapSqlParameterSource(
                        params
                ),
                keyHolder,
                new String[]{"Id"}
        );

        Number key =
                keyHolder.getKey();

        if (key == null) {
            throw new IllegalStateException(
                    "Cannot get generated AlertRule Id"
            );
        }

        return key.longValue();
    }

    public int update(
            long id,
            AlertRuleRequest request
    ) {

        String sql = """
            UPDATE AlertRule
            SET
                RuleCode = :ruleCode,
                RuleName = :ruleName,
                Module = :module,
                Metric = :metric,
                Operator = :operator,
                ThresholdValue = :thresholdValue,
                Priority = :priority,
                MessageTemplate = :messageTemplate,
                ActionUrl = :actionUrl,
                ActiveFrom = :activeFrom,
                ActiveUntil = :activeUntil,
                Enabled = :enabled,
                UpdatedAt = SYSDATETIME()
            WHERE Id = :id
            """;

        Map<String, Object> params =
                Map.ofEntries(
                        Map.entry("id", id),
                        Map.entry(
                                "ruleCode",
                                request.ruleCode()
                        ),
                        Map.entry(
                                "ruleName",
                                request.ruleName()
                        ),
                        Map.entry(
                                "module",
                                request.module()
                        ),
                        Map.entry(
                                "metric",
                                request.metric().name()
                        ),
                        Map.entry(
                                "operator",
                                request.operator().name()
                        ),
                        Map.entry(
                                "thresholdValue",
                                request.thresholdValue()
                        ),
                        Map.entry(
                                "priority",
                                request.priority().name()
                        ),
                        Map.entry(
                                "messageTemplate",
                                request.messageTemplate() != null
                                        ? request.messageTemplate()
                                        : ""
                        ),
                        Map.entry(
                                "actionUrl",
                                request.actionUrl() != null
                                        ? request.actionUrl()
                                        : ""
                        ),
                        Map.entry(
                                "activeFrom",
                                request.activeFrom() != null
                                        ? Time.valueOf(
                                        request.activeFrom()
                                )
                                        : Time.valueOf("00:00:00")
                        ),
                        Map.entry(
                                "activeUntil",
                                request.activeUntil() != null
                                        ? Time.valueOf(
                                        request.activeUntil()
                                )
                                        : Time.valueOf("23:59:59")
                        ),
                        Map.entry(
                                "enabled",
                                request.enabled()
                        )
                );

        return jdbc.update(
                sql,
                params
        );
    }

    public int updateEnabled(
            long id,
            boolean enabled
    ) {

        String sql = """
            UPDATE AlertRule
            SET
                Enabled = :enabled,
                UpdatedAt = SYSDATETIME()
            WHERE Id = :id
            """;

        return jdbc.update(
                sql,
                Map.of(
                        "id", id,
                        "enabled", enabled
                )
        );
    }

    public int delete(long id) {

        String sql = """
            DELETE FROM AlertRule
            WHERE Id = :id
            """;

        return jdbc.update(
                sql,
                Map.of("id", id)
        );
    }
}