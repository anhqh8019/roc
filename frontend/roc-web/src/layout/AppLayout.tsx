import {
  useState,
  type ReactNode,
} from "react";

import {
  Menu,
} from "lucide-react";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

import "../styles/dashboard-shell.css";

interface Props {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: Props) {

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <div className="app-shell">

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() =>
            setMobileMenuOpen(false)
          }
        />
      )}

      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />

      <div className="app-main">

        <div className="mobile-header-row">

          <button
            type="button"
            className="mobile-menu-button"
            aria-label="Mở menu"
            onClick={() =>
              setMobileMenuOpen(true)
            }
          >
            <Menu size={20} />
          </button>

          <span>
            RESOFT
          </span>

        </div>

        <TopHeader />

        <main className="app-content">
          {children}
        </main>

      </div>

    </div>
  );
}