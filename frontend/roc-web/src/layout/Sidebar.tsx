import {
  LayoutDashboard,
  Hotel,
  Utensils,
  Waves,
  Sparkles,
  CalendarDays,
  Bell,
  ClipboardList,
  Wrench,
  DollarSign,
  Gauge,
  FileText,
  BarChart3,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard CEO",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Khách sạn",
    icon: Hotel,
  },
  {
    label: "Nhà hàng",
    icon: Utensils,
  },
  {
    label: "Tắm khoáng",
    icon: Waves,
  },
  {
    label: "Spa",
    icon: Sparkles,
  },
  {
    label: "Sự kiện & Hội nghị",
    icon: CalendarDays,
  },
  {
    label: "Cảnh báo",
    icon: Bell,
  },
  {
    label: "Công việc",
    icon: ClipboardList,
  },
  {
    label: "Bảo trì thiết bị",
    icon: Wrench,
  },
  {
    label: "Doanh thu",
    icon: DollarSign,
  },
  {
    label: "KPI",
    icon: Gauge,
  },
  {
    label: "Báo cáo",
    icon: FileText,
  },
  {
    label: "Phân tích nâng cao",
    icon: BarChart3,
  },
  {
    label: "Hệ thống",
    icon: Settings,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-brand">
        <div className="brand-logo">
          RESOFT
        </div>

        <div className="brand-subtitle">
          OPERATION CENTER
        </div>
      </div>


      <nav className="sidebar-nav">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              className={`sidebar-item ${
                item.active
                  ? "active"
                  : ""
              }`}
            >
              <Icon
                size={16}
                strokeWidth={1.8}
                className="sidebar-icon"
              />

              <span className="sidebar-label">
                {item.label}
              </span>
            </button>
          );
        })}

      </nav>

    </aside>
  );
}