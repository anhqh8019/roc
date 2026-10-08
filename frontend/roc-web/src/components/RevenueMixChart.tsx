import { useEffect, useMemo, useState } from "react";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { HotelDashboardResponse } from "../types/hotel";
import type {
  CustomerDemographicsResponse,
  CustomerMixResponse,
  RevenueMixResponse,
  RevenueTrendResponse,
} from "../types/businessInsights";
import {
  getCustomerDemographics,
  getCustomerMix,
  getRevenueMix,
  getRevenueTrend,
} from "../api/businessInsightsApi";

interface Props {
  data: HotelDashboardResponse;
}

const COLORS = ["#188df2", "#19bf73", "#f59e0b", "#8b5cf6", "#64748b"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(value);
}

function shortDate(value: string) {
  const parts = value.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
}

function Metric({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div style={{ padding: "9px 10px", border: "1px solid rgba(148,163,184,.14)", borderRadius: 9, background: "rgba(15,35,50,.45)" }}>
      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#e8f4fb" }}>{value}</div>
      {detail && <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>{detail}</div>}
    </div>
  );
}

export default function RevenueMixChart({ data }: Props) {
  const [revenueMix, setRevenueMix] = useState<RevenueMixResponse | null>(null);
  const [trend, setTrend] = useState<RevenueTrendResponse | null>(null);
  const [customerMix, setCustomerMix] = useState<CustomerMixResponse | null>(null);
  const [demographics, setDemographics] = useState<CustomerDemographicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(false);

      const results = await Promise.allSettled([
        getRevenueMix(data.businessDate),
        getRevenueTrend(data.businessDate, 7),
        getCustomerMix(data.businessDate),
        getCustomerDemographics(data.businessDate),
      ]);

      if (cancelled) return;

      if (results[0].status === "fulfilled") setRevenueMix(results[0].value);
      else setRevenueMix(null);

      if (results[1].status === "fulfilled") setTrend(results[1].value);
      else setTrend(null);

      if (results[2].status === "fulfilled") setCustomerMix(results[2].value);
      else setCustomerMix(null);

      if (results[3].status === "fulfilled") setDemographics(results[3].value);
      else setDemographics(null);

      setError(results.every((item) => item.status === "rejected"));
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [data.businessDate]);

  const mixData = useMemo(
    () => revenueMix?.businessUnits.map((item) => ({
      name: item.businessUnit,
      value: item.revenue,
      percent: item.contributionPercent,
    })) ?? [],
    [revenueMix]
  );

  const ageGroups = demographics?.ageGroups ?? [];
  const topAge = [...ageGroups]
    .filter((item) => (item.group ?? item.label ?? "") !== "UNKNOWN")
    .sort((a, b) => b.count - a.count)[0];
  const topNationality = [...(demographics?.nationalities ?? demographics?.nationalityGroups ?? [])]
    .filter((item) => (item.nationality ?? item.group ?? item.label ?? "") !== "UNKNOWN")
    .sort((a, b) => b.count - a.count)[0];

  if (loading) {
    return <div style={{ padding: "28px 0", textAlign: "center", color: "#64748b", fontSize: 12 }}>Đang tải Business Insights...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px 0", color: "#f87171", fontSize: 12 }}>Không tải được Business Insights.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {trend && trend.data.length > 0 && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <strong style={{ fontSize: 12, color: "#cbd5e1" }}>Xu hướng doanh thu</strong>
            <span style={{ fontSize: 9, color: "#64748b" }}>7 ngày</span>
          </div>
          <div style={{ height: 128 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.data} margin={{ top: 8, right: 4, left: -26, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}m`} tick={{ fill: "#64748b", fontSize: 8 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${formatMoney(Number(value))} đ`} labelFormatter={(label) => `Ngày ${shortDate(String(label))}`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 11 }} />
                <Line type="monotone" dataKey="revenue" stroke="#22c7ff" strokeWidth={2.4} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {revenueMix && (
        <section style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <strong style={{ fontSize: 12, color: "#cbd5e1" }}>Cơ cấu theo đơn vị</strong>
            <span style={{ fontSize: 10, color: "#94a3b8" }}>{formatMoney(revenueMix.totalRevenue)} đ</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "112px 1fr", gap: 8, alignItems: "center" }}>
            <div style={{ height: 112 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={mixData} dataKey="value" nameKey="name" innerRadius={31} outerRadius={48} paddingAngle={2} stroke="none">
                    {mixData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => `${formatMoney(Number(value))} đ`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gap: 5 }}>
              {mixData.map((item, index) => (
                <div key={item.name} style={{ display: "grid", gridTemplateColumns: "8px 48px 1fr", gap: 6, alignItems: "center", fontSize: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS[index % COLORS.length] }} />
                  <span style={{ color: "#94a3b8" }}>{item.name}</span>
                  <strong style={{ color: "#e2e8f0", textAlign: "right" }}>{item.percent.toFixed(2)}%</strong>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {customerMix && (
        <section style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 14 }}>
          <strong style={{ display: "block", fontSize: 12, color: "#cbd5e1", marginBottom: 8 }}>Hành vi sử dụng dịch vụ</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Metric
              label="Hotel → Onsen"
              value={customerMix.onsen.available && customerMix.onsen.conversionPercent != null ? `${customerMix.onsen.conversionPercent.toFixed(2)}%` : "N/A"}
              detail={customerMix.onsen.available && customerMix.onsen.usedGuests != null ? `${customerMix.onsen.usedGuests}/${customerMix.hotelGuests} khách` : "Chưa có dữ liệu"}
            />
            <Metric
              label="Breakfast utilization"
              value={customerMix.breakfast.available && customerMix.breakfast.utilizationPercent != null ? `${customerMix.breakfast.utilizationPercent.toFixed(2)}%` : "N/A"}
              detail={customerMix.breakfast.available && customerMix.breakfast.usedGuests != null && customerMix.breakfast.eligibleGuests != null ? `${customerMix.breakfast.usedGuests}/${customerMix.breakfast.eligibleGuests} khách đủ điều kiện` : "Không có dữ liệu POS"}
            />
          </div>
        </section>
      )}

      {demographics && (
        <section style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <strong style={{ fontSize: 12, color: "#cbd5e1" }}>Chân dung khách hàng</strong>
            <span style={{ fontSize: 9, color: "#64748b" }}>{demographics.totalGuests} khách</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <Metric
              label="Nhóm tuổi nổi bật"
              value={topAge ? (topAge.group ?? topAge.label ?? "—") : "—"}
              detail={topAge ? `${topAge.percent.toFixed(2)}% tổng khách` : "Chưa đủ dữ liệu"}
            />
            <Metric
              label="Quốc tịch nổi bật"
              value={topNationality ? (topNationality.nationality ?? topNationality.group ?? topNationality.label ?? "—") : "—"}
              detail={topNationality ? `${topNationality.percent.toFixed(2)}% tổng khách` : "Chưa đủ dữ liệu"}
            />
          </div>
          {ageGroups.length > 0 && (
            <div style={{ marginTop: 10, display: "grid", gap: 5 }}>
              {ageGroups.map((item) => {
                const label = item.group ?? item.label ?? "UNKNOWN";
                return (
                  <div key={label} style={{ display: "grid", gridTemplateColumns: "48px 1fr 42px", gap: 7, alignItems: "center", fontSize: 9 }}>
                    <span style={{ color: "#94a3b8" }}>{label}</span>
                    <div style={{ height: 5, background: "rgba(148,163,184,.12)", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(100, Math.max(0, item.percent))}%`, height: "100%", background: "#22c7ff", borderRadius: 99 }} />
                    </div>
                    <span style={{ color: "#cbd5e1", textAlign: "right" }}>{item.percent.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
