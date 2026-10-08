import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCustomerTrend, getRevenueUnitTrend } from "../api/businessInsightsApi";
import type { CustomerTrendResponse, RevenueUnitTrendResponse } from "../types/businessInsights";

interface Props { businessDate: string; }
type Period = "WEEK" | "MONTH" | "THREE_MONTHS";
const DAYS: Record<Period, number> = { WEEK: 7, MONTH: 30, THREE_MONTHS: 90 };
const UNIT_COLORS = ["#22c7ff", "#19bf73", "#f59e0b", "#8b5cf6", "#94a3b8"];

function shortDate(value: string) {
  const p = value.split("-");
  return p.length === 3 ? `${p[2]}/${p[1]}` : value;
}
function money(value: number) {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value);
}
function pct(value: number) { return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`; }
function change(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) * 100) / previous;
}
function startOfWeek(date: string) {
  const d = new Date(`${date}T00:00:00`);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().slice(0, 10);
}
function aggregate<T extends Record<string, any>>(data: T[], period: Period, sumKeys: string[]) {
  if (period === "WEEK") return data.map(row => ({ ...row, label: shortDate(String(row.date)) }));
  const groups = new Map<string, Record<string, any>>();
  for (const row of data) {
    const key = startOfWeek(String(row.date));
    const item = groups.get(key) ?? { date: key, label: `Tuần ${shortDate(key)}` };
    for (const field of sumKeys) item[field] = Number(item[field] ?? 0) + Number(row[field] ?? 0);
    groups.set(key, item);
  }
  return [...groups.values()];
}
function Kpi({ label, value, changeValue }: { label: string; value: string; changeValue?: number }) {
  return <div style={{ border: "1px solid rgba(148,163,184,.13)", borderRadius: 7, padding: "7px 9px", background: "rgba(8,28,42,.42)" }}>
    <div style={{ fontSize: 7, color: "#71899b" }}>{label}</div>
    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
      <strong style={{ fontSize: 13, color: "#edf6fb" }}>{value}</strong>
      {changeValue != null && <span style={{ fontSize: 7, color: changeValue >= 0 ? "#19bf73" : "#f87171" }}>{pct(changeValue)}</span>}
    </div>
  </div>;
}

export default function BusinessInsightsPanel({ businessDate }: Props) {
  const [period, setPeriod] = useState<Period>("WEEK");
  const [customers, setCustomers] = useState<CustomerTrendResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueUnitTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const days = DAYS[period];

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(false);
      const [c, r] = await Promise.allSettled([getCustomerTrend(businessDate, days), getRevenueUnitTrend(businessDate, days)]);
      if (cancelled) return;
      setCustomers(c.status === "fulfilled" ? c.value : null);
      setRevenue(r.status === "fulfilled" ? r.value : null);
      setError(c.status === "rejected" && r.status === "rejected");
      setLoading(false);
    }
    load(); return () => { cancelled = true; };
  }, [businessDate, days]);

  const customerData = useMemo(() => aggregate(customers?.data ?? [], period, ["adults", "children", "unknownAge"]), [customers, period]);
  const revenueData = useMemo(() => aggregate(revenue?.data ?? [], period, ["hotel", "foodBeverage", "onsen", "spa", "other"])
    .map(row => ({ ...row, total: Number(row.hotel ?? 0) + Number(row.foodBeverage ?? 0) + Number(row.onsen ?? 0) + Number(row.spa ?? 0) + Number(row.other ?? 0) })), [revenue, period]);

  const customerTotals = useMemo(() => customerData.reduce((a, x) => ({ adults: a.adults + Number(x.adults ?? 0), children: a.children + Number(x.children ?? 0), unknown: a.unknown + Number(x.unknownAge ?? 0) }), { adults: 0, children: 0, unknown: 0 }), [customerData]);
  const customerLastChange = customerData.length > 1 ? change(Number(customerData.at(-1)?.adults ?? 0) + Number(customerData.at(-1)?.children ?? 0), Number(customerData.at(-2)?.adults ?? 0) + Number(customerData.at(-2)?.children ?? 0)) : 0;

  const revenueTotals = useMemo(() => revenueData.reduce((a, x) => ({ hotel: a.hotel + Number(x.hotel ?? 0), foodBeverage: a.foodBeverage + Number(x.foodBeverage ?? 0), onsen: a.onsen + Number(x.onsen ?? 0), spa: a.spa + Number(x.spa ?? 0), other: a.other + Number(x.other ?? 0), total: a.total + Number(x.total ?? 0) }), { hotel: 0, foodBeverage: 0, onsen: 0, spa: 0, other: 0, total: 0 }), [revenueData]);
  const revenueLastChange = revenueData.length > 1 ? change(Number(revenueData.at(-1)?.total ?? 0), Number(revenueData.at(-2)?.total ?? 0)) : 0;
  const revenueMix = [
    { name: "Hotel", value: revenueTotals.hotel }, { name: "F&B", value: revenueTotals.foodBeverage },
    { name: "Onsen", value: revenueTotals.onsen }, { name: "Spa", value: revenueTotals.spa }, { name: "Other", value: revenueTotals.other },
  ];

  if (loading) return <div style={{ minHeight: 360, display: "grid", placeItems: "center", color: "#64748b", fontSize: 11 }}>Đang tải phân tích kinh doanh...</div>;
  if (error) return <div style={{ minHeight: 360, display: "grid", placeItems: "center", color: "#f87171", fontSize: 11 }}>Không tải được dữ liệu phân tích kinh doanh.</div>;

  return <div style={{ display: "grid", gap: 12, width: "100%" }}>
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <select value={period} onChange={e => setPeriod(e.target.value as Period)} style={{ background: "#071827", color: "#cbd5e1", border: "1px solid #18506c", borderRadius: 6, padding: "5px 24px 5px 9px", fontSize: 9 }}>
        <option value="WEEK">1 tuần</option><option value="MONTH">1 tháng</option><option value="THREE_MONTHS">3 tháng</option>
      </select>
    </div>

    {customers && <section style={{ borderBottom: "1px solid rgba(148,163,184,.12)", paddingBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 7 }}>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>Xu hướng khách hàng</div><div style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>{period === "WEEK" ? "Theo ngày" : "Tổng hợp theo tuần"}</div></div>
        <div style={{ fontSize: 7, color: "#64748b" }}>Adult ≥ 18 · Child &lt; 18</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 7 }}>
        <Kpi label="TỔNG LƯỢT KHÁCH" value={money(customerTotals.adults + customerTotals.children)} changeValue={customerLastChange} />
        <Kpi label="ADULT" value={money(customerTotals.adults)} />
        <Kpi label="CHILD" value={money(customerTotals.children)} />
      </div>
      <div style={{ height: 105 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={customerData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="rgba(148,163,184,.08)" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 9 }} />
        <Legend wrapperStyle={{ fontSize: 8 }} iconType="circle" iconSize={6} />
        <Line type="monotone" dataKey="adults" name="Adult" stroke="#22c7ff" strokeWidth={2.2} dot={{ r: 2 }} />
        <Line type="monotone" dataKey="children" name="Child" stroke="#19bf73" strokeWidth={2.2} dot={{ r: 2 }} />
      </LineChart></ResponsiveContainer></div>
      {customerTotals.unknown > 0 && <div style={{ fontSize: 7, color: "#64748b", textAlign: "right" }}>{money(customerTotals.unknown)} lượt thiếu BirthDate không phân loại Adult/Child.</div>}
    </section>}

    {revenue && <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 7 }}>
        <div><div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>Xu hướng doanh thu</div><div style={{ fontSize: 7, color: "#64748b", marginTop: 2 }}>{period === "WEEK" ? "Theo ngày" : "Tổng hợp theo tuần"}</div></div>
        <strong style={{ fontSize: 10, color: "#e2e8f0" }}>{money(revenueTotals.total)} đ</strong>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 5 }}>
            <Kpi label="DOANH THU KỲ" value={`${money(revenueTotals.total)} đ`} />
            <Kpi label="KỲ GẦN NHẤT" value={revenueData.length ? `${money(Number(revenueData.at(-1)?.total ?? 0))} đ` : "—"} changeValue={revenueLastChange} />
          </div>
          <div style={{ height: 105 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={revenueData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,.08)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${Math.round(Number(v) / 1_000_000)}m`} tick={{ fill: "#64748b", fontSize: 7 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => `${money(Number(v))} đ`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 9 }} />
            <Line type="monotone" dataKey="total" name="Tổng doanh thu" stroke="#22c7ff" strokeWidth={2.4} dot={{ r: 2 }} />
          </LineChart></ResponsiveContainer></div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(148,163,184,.12)", paddingLeft: 7 }}>
          <div style={{ fontSize: 8, color: "#94a3b8", marginBottom: 2 }}>Cơ cấu kỳ</div>
          <div style={{ height: 78 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={revenueMix} dataKey="value" nameKey="name" innerRadius={20} outerRadius={31} stroke="none">{revenueMix.map((x, i) => <Cell key={x.name} fill={UNIT_COLORS[i]} />)}</Pie><Tooltip formatter={v => `${money(Number(v))} đ`} contentStyle={{ background: "#0b1d2b", border: "1px solid #21445d", borderRadius: 7, color: "#fff", fontSize: 8 }} /></PieChart></ResponsiveContainer></div>
          <div style={{ display: "grid", gap: 2 }}>{revenueMix.map((x, i) => <div key={x.name} style={{ display: "grid", gridTemplateColumns: "6px 35px 1fr", gap: 3, fontSize: 7, alignItems: "center" }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: UNIT_COLORS[i] }} /><span style={{ color: "#94a3b8" }}>{x.name}</span><strong style={{ textAlign: "right", color: "#cbd5e1" }}>{revenueTotals.total ? `${(x.value * 100 / revenueTotals.total).toFixed(1)}%` : "0%"}</strong></div>)}</div>
        </div>
      </div>
    </section>}
  </div>;
}
