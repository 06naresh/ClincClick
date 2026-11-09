import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import Navbar from "./Navbar";

export default function PublicLayout() {
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
