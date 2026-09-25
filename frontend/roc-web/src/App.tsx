import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./auth/AuthContext";

import LoginPage from "./pages/LoginPage";

import HotelDashboardPage from "./pages/HotelDashboardPage";
import HotelRoomPage from "./pages/HotelRoomPage";
import HotelInHousePage from "./pages/HotelInHousePage";
import HotelArrivalsPage from "./pages/HotelArrivalsPage";
import HotelDeparturesPage from "./pages/HotelDeparturesPage";

import AlertsPage from "./pages/AlertsPage";
import AlertRulesPage from "./pages/AlertRulesPage";
import AlertHistoryPage from "./pages/AlertHistoryPage";
import {
  BusinessDateProvider,
} from "./context/BusinessDateContext";

import { AlertProvider } from "./context/AlertContext";

function AppContent() {

  const { isAuthenticated } =
    useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      <Route
        path="/dashboard"
        element={
          <HotelDashboardPage />
        }
      />

      <Route
        path="/hotel"
        element={
          <HotelRoomPage />
        }
      />

      <Route
        path="/hotel/in-house"
        element={
          <HotelInHousePage />
        }
      />

      <Route
        path="/hotel/arrivals"
        element={
          <HotelArrivalsPage />
        }
      />

      <Route
        path="/hotel/departures"
        element={
          <HotelDeparturesPage />
        }
      />

      <Route
        path="/alerts"
        element={
          <AlertsPage />
        }
      />

      <Route
        path="/alerts/rules"
        element={
          <AlertRulesPage />
        }
      />

      <Route
  path="/alerts/history"
  element={<AlertHistoryPage />}
/>

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessDateProvider>
        <AlertProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AlertProvider>
      </BusinessDateProvider>
    </AuthProvider>
  );
}