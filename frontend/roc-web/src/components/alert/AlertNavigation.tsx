import { NavLink } from "react-router-dom";
import "./AlertNavigation.css";

export default function AlertNavigation() {
  return (
    <div className="alert-navigation">

      <NavLink
        to="/alerts"
        end
        className={({ isActive }) =>
          isActive
            ? "alert-nav-item active"
            : "alert-nav-item"
        }
      >
        Cảnh báo hiện tại
      </NavLink>

      <NavLink
        to="/alerts/rules"
        className={({ isActive }) =>
          isActive
            ? "alert-nav-item active"
            : "alert-nav-item"
        }
      >
        Thiết lập Rule
      </NavLink>

            <NavLink
        to="/alerts/history"
        className={({ isActive }) =>
          isActive
            ? "alert-nav-item active"
            : "alert-nav-item"
        }
      >
        Lịch sử cảnh báo
      </NavLink>
      
 
    </div>
  );
}