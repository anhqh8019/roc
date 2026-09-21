import { AuthProvider, useAuth }
  from "./auth/AuthContext";

import LoginPage
  from "./pages/LoginPage";

import HotelDashboardPage
  from "./pages/HotelDashboardPage";

function AppContent() {

  const { isAuthenticated } =
    useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <HotelDashboardPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}