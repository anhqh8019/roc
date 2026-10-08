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

import {
  getCustomerDemographics,
  getCustomerMix,
  getRevenueMix,
  getRevenueTrend,
} from "../api/businessInsightsApi";
import type {
  CustomerDemographicsResponse,
  CustomerMixResponse,
  RevenueMixResponse,
  RevenueTrendResponse,
} from "../types/businessInsights";

interface Props {
  businessDate: string;
}

const COLORS = ["#188df2", "#19bf73", "#f59e0b", "#8b5cf6", "#64748b"];

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}

function shortDate(value: string) {
  const parts = value.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : value;
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div style={{ padding: "9px 10px", border: "1px solid rgba(148,163,184,.14)", borderRadius: 8, background: "rgba(15,35,50,.42)" }}>
      <div style={{ fontSize: 9, color: "#7f9bb0", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f7fb" }}>{value}</div>
      <div style={{ fontSize: 8, color: "#64748b", marginTop: 3 }}>{detail}</div>
    </div>
  );
}

export default function BusinessInsightsPanel({ businessDate }: Props) {
  const [revenueMix, setRevenueMix] = useState<RevenueMixResponse | null>(null);
  const [trend, setTrend] = useState<RevenueTrendResponse | null>(null);
  const [customerMix, setCustomerMix] = useState<CustomerMixResponse | null>(null);
  const [demographics, setDemographics] = useState<CustomerDemographicsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setAllFailed(false);

      const results = await Promise.allSettled([
        getRevenueMix(businessDate),
        getRevenueTrend(businessDate, 7),
        getCustomerMix(businessDate),
        getCustomerDemographics(businessDate),
      ]);

      if (cancelled) return;

      setRevenueMix(results[0].status === "fulfilled" ? results[0].value : null);
      setTrend(results[1].status === "fulfilled" ? results[1].value : null);
      setCustomerMix(results[2].status === "fulfilled" ? results[2].value : null);
      setDemographics(results[3].status === "fulfilled" ? results[3].value : null);
      setAllFailed(results.every((result) => result.status === "rejected"));
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [businessDate]);

  const mixData = useMemo(
    () => revenueMix?.businessUnits.map((item) => ({
      name: item.businessUnit,
      value: item.revenue,
      percent: item.contributionPercent,
    })) ?? [],
    [revenueMix]
  );

  const topAge = useMemo(
    () => [...(demographics?.ageGroups ?? [])]
      .filter((item) => item.group !== "UNKNOWN")
      .sort((a, b) => b.count - a.count)[0],
    [demographics]
  );

  const topNationality = useMemo(
    () => [...(demographics?.nationalities ?? [])]
      .filter((item) => item.nationality !== "UNKNOWN")
      .sort((a, b) => b.count - a.count)[0],
    [demographics]
  );

  if (loading) {
    return <div style={{ minHeight: 290, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>Đang tải phân tích kinh doanh...</div>;
  }

  if (allFailed) {
    return <div style={{ minHeight: 290, display: "grid", placeItems: "center", color: "#f87171", fontSize: 11 }}>Không tải được dữ liệu Business Insights.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {trend && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1" }}>Xu hướng doanh thu</span>
            <span style={{ fontSize: 8, color: "#64748b" }}>7 ngày</span>
          </div>
          <div style={{ height: 105 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend.data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${Math.round(Number(v) / 1_000_000)}m`} tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${formatMoney(Number(value))} đ`} labelFormatter={(label) => `Ngày ${shortDate(String(label))}`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 10 }} />
                <Line type="monotone" dataKey="revenue" stroke="#22c7ff" strokeWidth={2.2} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {revenueMix && (
          <div style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1" }}>Cơ cấu doanh thu</span>
              <span style={{ fontSize: 8, color: "#64748b" }}>{formatMoney(revenueMix.totalRevenue)} đ</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "88px 1fr", alignItems: "center" }}>
              <div style={{ height: 88 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={mixData} dataKey="value" nameKey="name" innerRadius={24} outerRadius={37} paddingAngle={2} stroke="none">
                      {mixData.map((item, index) => <Cell key={item.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => `${formatMoney(Number(value))} đ`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "grid", gap: 3 }}>
                {mixData.map((item, index) => (
                  <div key={item.name} style={{ display: "grid", gridTemplateColumns: "7px 45px 1fr", gap: 4, alignItems: "center", fontSize: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS[index % COLORS.length] }} />
                    <span style={{ color: "#94a3b8" }}>{item.name}</span>
                    <strong style={{ color: "#e2e8f0", textAlign: "right" }}>{item.percent.toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {customerMix && (
          <div style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 9 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1", marginBottom: 7 }}>Sử dụng dịch vụ</div>
            <div style={{ display: "grid", gap: 6 }}>
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
          </div>
        )}
      </div>

      {demographics && (
        <div style={{ borderTop: "1px solid rgba(148,163,184,.12)", paddingTop: 9 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: "#cbd5e1" }}>Chân dung khách hàng</span>
            <span style={{ fontSize: 8, color: "#64748b" }}>{demographics.totalGuests} khách · phủ tuổi {demographics.ageCoveragePercent.toFixed(1)}%</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            <Metric label="Nhóm tuổi nổi bật" value={topAge?.group ?? "—"} detail={topAge ? `${topAge.percent.toFixed(1)}% tổng khách` : "Chưa đủ dữ liệu"} />
            <Metric label="Quốc tịch nổi bật" value={topNationality?.nationality ?? "—"} detail={topNationality ? `${topNationality.percent.toFixed(1)}% tổng khách` : "Chưa đủ dữ liệu"} />
          </div>
        </div>
      )}
    </div>
  );
}
