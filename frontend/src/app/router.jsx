import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AuthLayout from "../components/layout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CustomerDashboardPage from "../features/dashboard/pages/CustomerDashboardPage";
import AdminDashboardPage from "../features/dashboard/pages/AdminDashboardPage";

import ServicesPage from "../features/services/pages/ServicesPage";
import ServiceDetailsPage from "../features/services/pages/ServiceDetailsPage";
import AdminServicesPage from "../features/services/pages/AdminServicesPage";

import AdminProvidersPage from "../features/providers/pages/AdminProvidersPage";
import AdminAvailabilityPage from "../features/availability/pages/AdminAvailabilityPage";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // Public customer-facing pages
  { path: "/services", element: <ServicesPage /> },
  { path: "/services/:serviceId", element: <ServiceDetailsPage /> },

  // Customer-protected
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <CustomerDashboardPage />
      </ProtectedRoute>
    ),
  },

  // Admin-protected
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/services",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminServicesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/providers",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminProvidersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/availability",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminAvailabilityPage />
      </ProtectedRoute>
    ),
  },

  { path: "*", element: <LoginPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default router