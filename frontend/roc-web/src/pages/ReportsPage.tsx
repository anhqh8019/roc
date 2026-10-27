import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import AppLayout from "../layout/AppLayout";
import { getMonthlyOperationsReport, type MonthlyReportRow } from "../api/reportApi";
import "./ReportsPage.css";

const money = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const currentYear = new Date().getFullYear();

function excelCell(value: string | number) {
  const text = String(value).replace(/"/g, '""');
  return `"${text}"`;
}

export default function ReportsPage() {
  const [year, setYear] = useState(currentYear);
  const [toMonth, setToMonth] = useState(12);
  const [rows, setRows] = useState<MonthlyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMonthlyOperationsReport(year, toMonth);
      setRows(data.months);
    } catch (e) {
      console.error(e);
      setError("Không tải được báo cáo tháng. Kiểm tra backend và kết nối Smile PMS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [year, toMonth]);

  const totals = useMemo(() => rows.reduce((a, r) => ({
    villaRevenue: a.villaRevenue + r.villaRevenue,
    hotelRevenue: a.hotelRevenue + r.hotelRevenue,
    onsenRevenue: a.onsenRevenue + r.onsenRevenue,
    restaurantRevenue: a.restaurantRevenue + r.restaurantRevenue,
    villaRoomsSold: a.villaRoomsSold + r.villaRoomsSold,
    hotelRoomsSold: a.hotelRoomsSold + r.hotelRoomsSold,
    unallocated: a.unallocated + r.unallocatedRoomRevenue,
  }), { villaRevenue: 0, hotelRevenue: 0, onsenRevenue: 0, restaurantRevenue: 0, villaRoomsSold: 0, hotelRoomsSold: 0, unallocated: 0 }), [rows]);

  const downloadExcel = () => {
    if (loading || rows.length === 0) return;

    const lines = [
      ["BÁO CÁO DOANH THU & PHÒNG BÁN THEO THÁNG"],
      [`Năm ${year} - đến tháng ${toMonth}`],
      [],
      ["Tháng", "Doanh thu Biệt thự", "Doanh thu Khách sạn", "Doanh thu Onsen", "Doanh thu Nhà hàng", "Số phòng bán Biệt thự", "Số phòng bán Khách sạn", "Doanh thu phòng chưa phân bổ"],
      ...rows.map(r => [
        `Tháng ${r.month}`,
        r.villaRevenue,
        r.hotelRevenue,
        r.onsenRevenue,
        r.restaurantRevenue,
        r.villaRoomsSold,
        r.hotelRoomsSold,
        r.unallocatedRoomRevenue,
      ]),
      ["Tổng", totals.villaRevenue, totals.hotelRevenue, totals.onsenRevenue, totals.restaurantRevenue, totals.villaRoomsSold, totals.hotelRoomsSold, totals.unallocated],
    ];

    // UTF-8 BOM helps Excel open Vietnamese text correctly. Excel opens this CSV directly.
    const csv = "\uFEFF" + lines.map(line => line.map(excelCell).join(";")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bao-cao-doanh-thu-phong-ban-${year}-T01-T${String(toMonth).padStart(2, "0")}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout>
      <section className="reports-page">
        <div className="reports-heading">
          <div>
            <p className="reports-kicker">BÁO CÁO QUẢN TRỊ</p>
            <h1>Báo cáo doanh thu & phòng bán theo tháng</h1>
            <p>Doanh thu ghi nhận từ Smile PMS · Villa / Khách sạn / Onsen / Nhà hàng</p>
          </div>
          <div className="reports-filters">
            <label>Năm<select value={year} onChange={e => setYear(Number(e.target.value))}>{[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y}>{y}</option>)}</select></label>
            <label>Đến tháng<select value={toMonth} onChange={e => setToMonth(Number(e.target.value))}>{Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}</select></label>
            <button type="button" onClick={() => void load()} disabled={loading}><RefreshCw size={15} /> Làm mới</button>
            <button type="button" onClick={downloadExcel} disabled={loading || rows.length === 0}><Download size={15} /> Tải Excel</button>
          </div>
        </div>

        {error && <div className="reports-error"><AlertTriangle size={16} />{error}</div>}

        <div className="reports-table-card">
          <div className="reports-table-scroll">
            <table className="reports-table">
              <thead>
                <tr><th rowSpan={2}>Tháng</th><th colSpan={4}>Doanh thu</th><th colSpan={2}>Số phòng đã bán</th></tr>
                <tr><th>Biệt thự</th><th>Khách sạn</th><th>Onsen</th><th>Nhà hàng</th><th>Biệt thự</th><th>Khách sạn</th></tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="reports-state">Đang tải dữ liệu...</td></tr> : rows.map(r => (
                  <tr key={r.month}>
                    <td className="month-cell">Tháng {r.month}</td>
                    <td>{money.format(r.villaRevenue)}</td><td>{money.format(r.hotelRevenue)}</td><td>{money.format(r.onsenRevenue)}</td><td>{money.format(r.restaurantRevenue)}</td>
                    <td>{money.format(r.villaRoomsSold)}</td><td>{money.format(r.hotelRoomsSold)}</td>
                  </tr>
                ))}
              </tbody>
              {!loading && rows.length > 0 && <tfoot><tr><td>Tổng</td><td>{money.format(totals.villaRevenue)}</td><td>{money.format(totals.hotelRevenue)}</td><td>{money.format(totals.onsenRevenue)}</td><td>{money.format(totals.restaurantRevenue)}</td><td>{money.format(totals.villaRoomsSold)}</td><td>{money.format(totals.hotelRoomsSold)}</td></tr></tfoot>}
            </table>
          </div>
        </div>

        {!loading && totals.unallocated !== 0 && <div className="reports-audit"><AlertTriangle size={17} /><div><strong>Doanh thu phòng chưa phân bổ: {money.format(totals.unallocated)} ₫</strong><span>Khoản này được giữ riêng để audit, không tự động gán vào Biệt thự hoặc Khách sạn.</span></div></div>}
      </section>
    </AppLayout>
  );
}
