import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../../features/dashboard/pages/DashboardPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import TicketsPage from "../../features/tickets/pages/TicketsPage";
import NotificationsPage from "../../features/notifications/pages/NotificationsPage";
import DashboardLayout from "../../components/layout/DashboardLayout";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;