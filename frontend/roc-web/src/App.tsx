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
import {
  BusinessDateProvider,
} from "./context/BusinessDateContext";

import HotelDeparturesPage from
  "./pages/HotelDeparturesPage";

function AppContent() {
  const { isAuthenticated } = useAuth();

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
        element={<HotelDashboardPage />}
      />

      <Route
        path="/hotel"
        element={<HotelRoomPage />}
      />

      <Route
        path="/hotel/in-house"
        element={<HotelInHousePage />}
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

      <Route
  path="/hotel/arrivals"
  element={<HotelArrivalsPage />}
/>

<Route
  path="/hotel/departures"
  element={<HotelDeparturesPage />}
/>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessDateProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </BusinessDateProvider>
    </AuthProvider>
  );
}