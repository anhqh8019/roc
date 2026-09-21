import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import "../styles/dashboard-shell.css";

interface Props {
  children: ReactNode;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function AppLayout({
  children,
  selectedDate,
  onDateChange,
}: Props) {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <TopHeader
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}