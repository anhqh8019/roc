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

import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard CEO",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Khách sạn",
    icon: Hotel,
    path: "/hotel",
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

          if (item.path) {
            return (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-item ${
                    isActive ? "active" : ""
                  }`
                }
              >
                <Icon
                  size={16}
                  strokeWidth={1.8}
                  className="sidebar-icon"
                />

                <span className="sidebar-label">
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              className="sidebar-item"
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