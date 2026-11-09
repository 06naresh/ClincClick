// Route guard enforcing authentication (and, optionally, role).
//
// Returns nothing while the auth state is still being restored from a refresh
// token — avoiding a flash redirect during reload (Task 3.6).

import { Navigate, useLocation } from "react-router-dom";

import Spinner from "../ui/Spinner";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    // Customers trying admin routes go to their dashboard, admins trying
    // customer routes go to the admin dashboard.
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />
  }

  // Admins that land on the customer dashboard are redirected to admin.
  if (!allowedRoles?.length && user.role === "admin" && location.pathname.startsWith("/dashboard")) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}
