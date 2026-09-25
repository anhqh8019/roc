import {
  useEffect,
  useState,
} from "react";

import {
  createAlertRule,
  deleteAlertRule,
  getAlertRules,
  setAlertRuleEnabled,
  updateAlertRule,
} from "../api/alertApi";

import type {
  AlertMetric,
  AlertOperator,
  AlertPriority,
  AlertRule,
  AlertRuleRequest,
} from "../types/alert";

import "./AlertRulesPage.css";

import AppLayout from "../layout/AppLayout";

import AlertNavigation from "../components/alert/AlertNavigation";

const EMPTY_RULE: AlertRuleRequest = {
  ruleCode: "",
  ruleName: "",
  module: "HOUSEKEEPING",
  metric: "DIRTY_ROOMS",
  operator: "GTE",
  thresholdValue: 1,
  priority: "P3",
  messageTemplate:
    "Hiện có {value} phòng đang ở trạng thái Dirty.",
  actionUrl: "/hotel",
  activeFrom: null,
  activeUntil: null,
  enabled: true,
};

export default function AlertRulesPage() {

  const [rules, setRules] =
    useState<AlertRule[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<AlertRuleRequest>(
      EMPTY_RULE
    );

  async function loadRules() {

    try {

      setLoading(true);

      const result =
        await getAlertRules();

      setRules(result);

    } catch (error) {

      console.error(
        "Load alert rules error:",
        error
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
  }, []);

  function updateForm<K extends keyof AlertRuleRequest>(
    field: K,
    value: AlertRuleRequest[K]
  ) {

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startCreate() {

    setEditingId(null);

    setForm({
      ...EMPTY_RULE,
    });
  }

  function startEdit(
    rule: AlertRule
  ) {

    setEditingId(rule.id);

    setForm({
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      module: rule.module,
      metric: rule.metric,
      operator: rule.operator,
      thresholdValue:
        rule.thresholdValue,
      priority: rule.priority,
      messageTemplate:
        rule.messageTemplate,
      actionUrl:
        rule.actionUrl,
      activeFrom:
        normalizeTime(rule.activeFrom),
      activeUntil:
        normalizeTime(rule.activeUntil),
      enabled: rule.enabled,
    });
  }

  async function saveRule() {

    if (
      !form.ruleCode.trim() ||
      !form.ruleName.trim()
    ) {
      alert(
        "Vui lòng nhập Rule Code và Tên Rule."
      );
      return;
    }

    try {

      setSaving(true);

      if (editingId == null) {

        await createAlertRule(form);

      } else {

        await updateAlertRule(
          editingId,
          form
        );
      }

      await loadRules();

      startCreate();

    } catch (error) {

      console.error(
        "Save alert rule error:",
        error
      );

      alert(
        "Không thể lưu Alert Rule."
      );

    } finally {

      setSaving(false);
    }
  }

  async function toggleEnabled(
    rule: AlertRule
  ) {

    try {

      await setAlertRuleEnabled(
        rule.id,
        !rule.enabled
      );

      await loadRules();

    } catch (error) {

      console.error(
        "Toggle rule error:",
        error
      );
    }
  }

  async function removeRule(
    rule: AlertRule
  ) {

    const confirmed =
      window.confirm(
        `Xóa rule "${rule.ruleName}"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      await deleteAlertRule(
        rule.id
      );

      await loadRules();

      if (
        editingId === rule.id
      ) {
        startCreate();
      }

    } catch (error) {

      console.error(
        "Delete rule error:",
        error
      );
    }
  }

return (
  <AppLayout>
    <div className="alert-rules-page">

      <AlertNavigation />

      <div className="alert-rules-toolbar">
        <div>
          <h2>Thiết lập Rule</h2>
          <p>
            Cấu hình điều kiện sinh cảnh báo vận hành.
          </p>
        </div>

        <button
          className="alert-button primary"
          onClick={startCreate}
        >
          + Tạo Rule
        </button>
      </div>

      <div className="alert-rules-layout">

        {/* DANH SÁCH RULE */}
        <section className="alert-rule-list-card">

          <div className="alert-card-title">
            Danh sách Rule
          </div>

          {loading ? (
            <div className="alert-empty">
              Đang tải...
            </div>
          ) : (
            <div className="alert-rule-table-wrapper">
              <table className="alert-rule-table">

                <thead>
                  <tr>
                    <th>Tên Rule</th>
                    <th>Metric</th>
                    <th>Điều kiện</th>
                    <th>Priority</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.id}>

                      <td>
                        <div className="rule-name">
                          {rule.ruleName}
                        </div>

                        <div className="rule-code">
                          {rule.ruleCode}
                        </div>
                      </td>

                      <td>
                        {metricLabel(rule.metric)}
                      </td>

                      <td>
                        {operatorLabel(rule.operator)}
                        {" "}
                        {rule.thresholdValue}
                      </td>

                      <td>
                        <span
                          className={
                            `priority-badge ${rule.priority.toLowerCase()}`
                          }
                        >
                          {rule.priority}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            rule.enabled
                              ? "rule-toggle enabled"
                              : "rule-toggle"
                          }
                          onClick={() =>
                            toggleEnabled(rule)
                          }
                        >
                          {rule.enabled ? "Bật" : "Tắt"}
                        </button>
                      </td>

                      <td>
                        <div className="rule-actions">

                          <button
                            type="button"
                            onClick={() =>
                              startEdit(rule)
                            }
                          >
                            Sửa
                          </button>

                          <button
                            type="button"
                            className="danger-text"
                            onClick={() =>
                              removeRule(rule)
                            }
                          >
                            Xóa
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {rules.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="alert-empty"
                      >
                        Chưa có Alert Rule.
                      </td>
                    </tr>
                  )}

                </tbody>

              </table>
            </div>
          )}

        </section>

        {/* FORM RULE */}
        <section className="alert-rule-form-card">

          <div className="alert-card-title">
            {editingId == null
              ? "Tạo Rule"
              : "Chỉnh sửa Rule"}
          </div>

          <div className="alert-form">

            <Field label="Rule Code">
              <input
                value={form.ruleCode}
                disabled={editingId != null}
                onChange={(e) =>
                  updateForm(
                    "ruleCode",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Tên Rule">
              <input
                value={form.ruleName}
                onChange={(e) =>
                  updateForm(
                    "ruleName",
                    e.target.value
                  )
                }
              />
            </Field>

            <Field label="Module">
              <select
                value={form.module}
                onChange={(e) =>
                  updateForm(
                    "module",
                    e.target.value
                  )
                }
              >
                <option value="HOTEL">
                  Hotel
                </option>

                <option value="HOUSEKEEPING">
                  Housekeeping
                </option>
              </select>
            </Field>

            <Field label="Metric">
              <select
                value={form.metric}
                onChange={(e) =>
                  updateForm(
                    "metric",
                    e.target.value as AlertMetric
                  )
                }
              >
                <option value="DIRTY_ROOMS">
                  Dirty Rooms
                </option>

                <option value="PENDING_ARRIVALS">
                  Pending Arrivals
                </option>

                <option value="DUE_OUT_DEPARTURES">
                  Due-out Departures
                </option>

                <option value="OCCUPANCY_PERCENT">
                  Occupancy %
                </option>
              </select>
            </Field>

            <div className="alert-form-row">

              <Field label="Operator">
                <select
                  value={form.operator}
                  onChange={(e) =>
                    updateForm(
                      "operator",
                      e.target.value as AlertOperator
                    )
                  }
                >
                  <option value="GT">&gt;</option>
                  <option value="GTE">≥</option>
                  <option value="LT">&lt;</option>
                  <option value="LTE">≤</option>
                  <option value="EQ">=</option>
                </select>
              </Field>

              <Field label="Threshold">
                <input
                  type="number"
                  value={form.thresholdValue}
                  onChange={(e) =>
                    updateForm(
                      "thresholdValue",
                      Number(e.target.value)
                    )
                  }
                />
              </Field>

            </div>

            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(e) =>
                  updateForm(
                    "priority",
                    e.target.value as AlertPriority
                  )
                }
              >
                <option value="P1">
                  P1 - Critical
                </option>

                <option value="P2">
                  P2 - High
                </option>

                <option value="P3">
                  P3 - Medium
                </option>

                <option value="P4">
                  P4 - Info
                </option>
              </select>
            </Field>

            <div className="alert-form-row">

              <Field label="Từ giờ">
                <input
                  type="time"
                  value={form.activeFrom ?? ""}
                  onChange={(e) =>
                    updateForm(
                      "activeFrom",
                      e.target.value || null
                    )
                  }
                />
              </Field>

              <Field label="Đến giờ">
                <input
                  type="time"
                  value={form.activeUntil ?? ""}
                  onChange={(e) =>
                    updateForm(
                      "activeUntil",
                      e.target.value || null
                    )
                  }
                />
              </Field>

            </div>

            <Field label="Message">
              <textarea
                rows={3}
                value={
                  form.messageTemplate ?? ""
                }
                onChange={(e) =>
                  updateForm(
                    "messageTemplate",
                    e.target.value
                  )
                }
              />

              <div className="field-help">
                Dùng {"{value}"} để chèn giá trị metric.
              </div>
            </Field>

            <Field label="Action URL">
              <input
                value={form.actionUrl ?? ""}
                onChange={(e) =>
                  updateForm(
                    "actionUrl",
                    e.target.value
                  )
                }
              />
            </Field>

            <label className="enabled-checkbox">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  updateForm(
                    "enabled",
                    e.target.checked
                  )
                }
              />

              <span>Bật Rule</span>
            </label>

            <div className="alert-form-actions">

              <button
                type="button"
                className="alert-button secondary"
                onClick={startCreate}
              >
                Hủy
              </button>

              <button
                type="button"
                className="alert-button primary"
                disabled={saving}
                onClick={saveRule}
              >
                {saving
                  ? "Đang lưu..."
                  : editingId == null
                    ? "Tạo Rule"
                    : "Lưu thay đổi"}
              </button>

            </div>

          </div>

        </section>

      </div>

    </div>
  </AppLayout>
);
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {

  return (
    <label className="alert-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function normalizeTime(
  value: string | null
) {

  if (!value) {
    return null;
  }

  return value.substring(0, 5);
}

function operatorLabel(
  operator: AlertOperator
) {

  switch (operator) {
    case "GT":
      return ">";
    case "GTE":
      return "≥";
    case "LT":
      return "<";
    case "LTE":
      return "≤";
    case "EQ":
      return "=";
  }
}

function metricLabel(
  metric: AlertMetric
) {

  switch (metric) {
    case "DIRTY_ROOMS":
      return "Dirty Rooms";

    case "PENDING_ARRIVALS":
      return "Pending Arrivals";

    case "DUE_OUT_DEPARTURES":
      return "Due-out Departures";

    case "OCCUPANCY_PERCENT":
      return "Occupancy %";
  }
}