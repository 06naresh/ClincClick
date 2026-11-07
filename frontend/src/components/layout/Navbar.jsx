// Top navigation bar shown on dashboards while the full sidebar is built in Phase 08.

import { LogOut } from "lucide-react";
import Button from "../ui/Button";

export default function Navbar({ user, onLogout }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-stroke bg-surface px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-heading">ClincClick</span>
        <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary-dark">
          {user?.role}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-body">{user?.full_name}</span>
        <Button variant="ghost" size="sm" onClick={onLogout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </Button>
      </div>
    </header>
  )
}
