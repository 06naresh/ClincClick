import { createBrowserRouter, RouterProvider } from "react-router-dom";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AuthLayout from "../components/layout/AuthLayout";
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import CustomerDashboardPage from "../features/dashboard/pages/CustomerDashboardPage";
import AdminDashboardPage from "../features/dashboard/pages/AdminDashboardPage";

const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <CustomerDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <LoginPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default router
