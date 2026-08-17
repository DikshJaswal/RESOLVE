import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import RegisterPage from "../../features/auth/pages/RegisterPage";
import TicketsPage from "../../features/tickets/pages/TicketsPage";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage";
import AdminPage from "../../features/admin/pages/AdminPage";
import SettingsPage from "../../features/settings/pages/SettingsPage";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getUser } from "../../lib/api";

function ProtectedLayout() {
  return getUser() ? <DashboardLayout /> : <Navigate to="/login" replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
