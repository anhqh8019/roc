import { NavLink } from "react-router-dom";

import "./HotelNavigation.css";

export default function HotelNavigation() {
  return (
    <nav className="hotel-navigation">
      <NavLink
        to="/hotel"
        end
        className={({ isActive }) =>
          isActive
            ? "hotel-nav-item active"
            : "hotel-nav-item"
        }
      >
        Room Operations
      </NavLink>

      <NavLink
        to="/hotel/in-house"
        className={({ isActive }) =>
          isActive
            ? "hotel-nav-item active"
            : "hotel-nav-item"
        }
      >
        In-house
      </NavLink>

      <NavLink
  to="/hotel/arrivals"
  className={({ isActive }) =>
    isActive
      ? "hotel-nav-item active"
      : "hotel-nav-item"
  }
>
  Arrivals
</NavLink>

<NavLink
  to="/hotel/departures"
  className={({ isActive }) =>
    isActive
      ? "hotel-nav-item active"
      : "hotel-nav-item"
  }
>
  Departures
</NavLink>


    </nav>
  );
}