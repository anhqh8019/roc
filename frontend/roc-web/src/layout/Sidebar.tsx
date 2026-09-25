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
 
import { useAlert } from "../context/AlertContext";


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
    path: "/alerts",
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

 
const { unreadCount } = useAlert();

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

          /*
           * Menu chưa có route:
           * render div, KHÔNG dùng NavLink.
           */
          if (!item.path) {

            return (
              <div
                key={item.label}
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

              </div>
            );
          }


          /*
           * Menu đã có route:
           * dùng NavLink.
           */
          return (
            <NavLink
              key={item.label}
              to={item.path}
              end
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


            {item.path === "/alerts" &&
              unreadCount > 0 && (
                <span className="sidebar-alert-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            </NavLink>
          );

        })}

      </nav>

    </aside>
  );
}