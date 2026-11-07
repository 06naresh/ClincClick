import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import AuthLayout from "../../../components/layout/AuthLayout";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { useAuth } from "../../../context/AuthContext";

const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required (min 2 characters)").max(150),
    email: z.string().email("Enter a valid email address"),
    phone: z
      .string()
      .optional()
      .refine(
        (v) => v === undefined || v === "" || /^[0-9+\-\s()]{6,20}$/.test(v),
        "Phone may contain digits, spaces, + - ( ) only (6-20 chars)"
      ),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(72, "Maximum 72 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/\d/, "Include at least one digit"),
    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", phone: "", password: "", confirm_password: "" },
  })

  const onSubmit = async (values) => {
    try {
      // Public registration never carries a role — backend enforces customer.
      const { confirm_password, ...payload } = values
      if (!payload.phone) delete payload.phone
      await registerUser(payload)
      toast.success("Account created. Please sign in.")
      navigate("/login")
    } catch (error) {
      const message =
        error?.response?.data?.message || "Registration failed. Please try again."
      toast.error(message)
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Join ClincClick">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input label="Full name" error={errors.full_name?.message} {...register("full_name")} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        <Input label="Phone (optional)" error={errors.phone?.message} {...register("phone")} />
        <Input label="Password" type="password" placeholder="At least 8 chars" error={errors.password?.message} {...register("password")} />
        <Input label="Confirm password" type="password" placeholder="Repeat password" error={errors.confirm_password?.message} {...register("confirm_password")} />
        <Button type="submit" loading={isSubmitting} fullWidth>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
