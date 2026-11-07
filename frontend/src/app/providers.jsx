// Shared global providers for the application (order does not matter much
// here because the router is passed through children).

import { Toaster } from "sonner";

import { AuthProvider } from "../context/AuthContext";

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <Toaster
        richColors
        closeButton
        position="top-right"
        toastOptions={{ duration: 4000 }}
      />
      {children}
    </AuthProvider>
  )
}
