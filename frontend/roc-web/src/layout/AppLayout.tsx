import type {
  ReactNode,
} from "react";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

import "../styles/dashboard-shell.css";

interface Props {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: Props) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <TopHeader />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}