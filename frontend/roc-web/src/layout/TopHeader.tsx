import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../auth/AuthContext";
import { useLocation } from "react-router-dom";

// interface TopHeaderProps {
//   selectedDate: string;
//   onDateChange: (date: string) => void;
// }

import {
  useBusinessDate,
} from "../context/BusinessDateContext";

export default function TopHeader() {
  const {
    businessDate,
    setBusinessDate,
  } = useBusinessDate();

 

const location = useLocation();

const pageInfo = (() => {
  const path =
    location.pathname;

  if (
    path.startsWith(
      "/hotel/arrivals"
    )
  ) {
    return {
      title: "Khách sạn",
      subtitle: "Arrivals",
    };
  }

  if (
    path.startsWith(
      "/hotel/departures"
    )
  ) {
    return {
      title: "Khách sạn",
      subtitle: "Departures",
    };
  }

  if (
    path.startsWith(
      "/hotel/in-house"
    )
  ) {
    return {
      title: "Khách sạn",
      subtitle: "In-house",
    };
  }

  if (
    path.startsWith("/hotel")
  ) {
    return {
      title: "Khách sạn",
      subtitle: "Room Operations",
    };

    
  }

    if (
    path.startsWith("/alerts")
  ) {
    return {
      title: "Cảnh báo",
      subtitle: "Operation Alert Center",
    };

    
  }
  

  return {
    title: "Dashboard CEO",
    subtitle:
      "Resoft Hot Springs Resort",
  };
})();


  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
  }

  function getInitials(
    fullName?: string
  ) {
    if (!fullName) {
      return "U";
    }

    const parts = fullName
      .trim()
      .split(/\s+/);

    if (parts.length === 1) {
      return parts[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  function formatRole(
    role?: string
  ) {
    if (!role) {
      return "";
    }

    const roleNames:
      Record<string, string> = {
        ADMIN: "Administrator",
        CEO: "CEO",
        HOTEL_MANAGER: "Hotel Manager",
        FRONT_OFFICE: "Front Office",
        HOUSEKEEPING: "Housekeeping",
        FNB_MANAGER: "F&B Manager",
        ONSEN_MANAGER: "Onsen Manager",
      };

    return (
      roleNames[role] ??
      role.replaceAll("_", " ")
    );
  }

  return (
    <header className="roc-top-header">

      {/* =========================
          LEFT
          ========================= */}

      <div className="roc-header-title">
        {pageInfo.title}
      </div>

      <div className="roc-header-resort">
        {pageInfo.subtitle}
      </div>


      {/* =========================
          RIGHT
          ========================= */}

      <div className="roc-header-actions">

        {/* BUSINESS DATE */}

        <div className="roc-business-date">
          <span>
            Business Date
          </span>

        <input
  type="date"
  value={businessDate}
  onChange={(e) =>
    setBusinessDate(
      e.target.value
    )
  }
/>


        </div>


        {/* SEPARATOR */}

        <div className="roc-header-separator" />


        {/* USER */}

        <div
          className="roc-user-wrapper"
          ref={menuRef}
        >
          <button
            type="button"
            className="roc-user-button"
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current
              )
            }
          >

            <div className="roc-user-avatar">
              {getInitials(
                user?.fullName
              )}
            </div>


            <div className="roc-user-text">
              <strong>
                {user?.fullName ??
                  "User"}
              </strong>

              <span>
                {formatRole(
                  user?.role
                )}
              </span>
            </div>


            <span
              className={
                `roc-user-chevron ${
                  menuOpen
                    ? "open"
                    : ""
                }`
              }
            >
              ▾
            </span>

          </button>


          {/* =========================
              USER MENU
              ========================= */}

          {menuOpen && (
            <div className="roc-user-menu">

              <div className="roc-menu-profile">

                <div className="roc-menu-avatar">
                  {getInitials(
                    user?.fullName
                  )}
                </div>

                <div>
                  <strong>
                    {user?.fullName}
                  </strong>

                  <span>
                    @{user?.username}
                  </span>
                </div>

              </div>


              <div className="roc-menu-divider" />


              <button
                type="button"
                className="roc-logout-button"
                onClick={handleLogout}
              >
                <span>
                  ↪
                </span>

                Đăng xuất
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}