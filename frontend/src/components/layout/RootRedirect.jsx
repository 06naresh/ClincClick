import { Navigate } from "react-router-dom";

import Spinner from "../ui/Spinner";
import { useAuth } from "../../context/AuthContext";

export default function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-live="polite">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }

  return <Navigate to="/login" replace />;
}
