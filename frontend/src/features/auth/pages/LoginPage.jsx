import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { z } from "zod";

import AuthLayout from "../../../components/layout/AuthLayout";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values) => {
    try {
      const data = await login(values)
      toast.success("Welcome back!")
      const from = location.state?.from
      if (from?.pathname && from.pathname !== "/login") {
        navigate(`${from.pathname}${from.search || ""}`, { replace: true })
      } else {
        navigate(data.user.role === "admin" ? "/admin/dashboard" : "/dashboard", { replace: true })
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Login failed. Check your credentials."
      toast.error(message)
    }
  }

if (user) {
    return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />
  }

  return (
    <AuthLayout title="Sign in" subtitle="Access your ClincClick account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-8 flex h-8 w-8 items-center justify-center rounded-md text-muted hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <Button type="submit" loading={isSubmitting} fullWidth>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary hover:text-primary-dark">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
