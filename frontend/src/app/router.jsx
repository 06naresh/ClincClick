import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import PublicLayout from "../components/layout/PublicLayout";
import CustomerLayout from "../components/layout/CustomerLayout";
import AdminLayout from "../components/layout/AdminLayout";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CustomerDashboardPage from "../features/dashboard/pages/CustomerDashboardPage";
import AdminDashboardPage from "../features/dashboard/pages/AdminDashboardPage";

import ServicesPage from "../features/services/pages/ServicesPage";
import ServiceDetailsPage from "../features/services/pages/ServiceDetailsPage";
import AdminServicesPage from "../features/services/pages/AdminServicesPage";

import AdminProvidersPage from "../features/providers/pages/AdminProvidersPage";
import AdminAvailabilityPage from "../features/availability/pages/AdminAvailabilityPage";

import ProfilePage from "../features/profile/pages/ProfilePage";
import MyBookingsPage from "../features/appointments/pages/MyBookingsPage";
import BookingDetailsPage from "../features/appointments/pages/BookingDetailsPage";
import AdminBookingsPage from "../features/appointments/pages/AdminBookingsPage";

const router = createBrowserRouter([
  // --- Public (customer-facing) --------------------------------------------
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <ServicesPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "services", element: <ServicesPage /> },
      { path: "services/:serviceId", element: <ServiceDetailsPage /> },
    ],
  },

  // --- Customer-protected --------------------------------------------------
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <CustomerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <CustomerDashboardPage /> },
      { path: "bookings", element: <MyBookingsPage /> },
      { path: "bookings/:bookingId", element: <BookingDetailsPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },

  // --- Admin-protected -----------------------------------------------------
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "services", element: <AdminServicesPage /> },
      { path: "providers", element: <AdminProvidersPage /> },
      { path: "availability", element: <AdminAvailabilityPage /> },
      { path: "bookings", element: <AdminBookingsPage /> },
    ],
  },

  { path: "/admin/dashboard", element: <ProtectedRoute allowedRoles={["admin"]}><AdminDashboardPage /></ProtectedRoute> },
  { path: "*", element: <ServicesPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default router
