import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import ProtectedRoute from "../components/layout/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

describe("ProtectedRoute", () => {
  it("redirects unauthenticated users to /login", () => {
    useAuth.mockReturnValue({ user: null, loading: false });
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/login" element={<div>Login page</div>} />
          <Route path="/dashboard" element={<ProtectedRoute><div>Secret</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret")).not.toBeInTheDocument();
  });

  it("renders children for an allowed role", () => {
    useAuth.mockReturnValue({ user: { role: "admin" }, loading: false });
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><div>Admin area</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Admin area")).toBeInTheDocument();
  });

  it("redirects customers away from admin routes", () => {
    useAuth.mockReturnValue({ user: { role: "customer" }, loading: false });
    render(
      <MemoryRouter initialEntries={["/admin/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<div>Customer dashboard</div>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><div>Admin area</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Customer dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin area")).not.toBeInTheDocument();
  });
});
