import { Outlet } from "react-router-dom";

import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={logout} />
      <main className="mx-auto w-[90%] max-w-7xl px-4 py-6 pt-14">
        <Outlet />
      </main>
    </div>
  );
}
