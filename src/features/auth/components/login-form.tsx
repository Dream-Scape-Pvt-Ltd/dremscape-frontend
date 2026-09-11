"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel, FormMessage } from "@/components/forms/form-field";
import { authApi } from "../api/auth";
import { loginSchema, type LoginInput } from "../schemas";

export function LoginForm() {
  const [formData, setFormData] = React.useState<LoginInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    await authApi.login(result.data);
    setIsLoading(false);
    window.location.href = "/";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField>
        <FormLabel required>Email Address</FormLabel>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="trekker@example.com"
        />
        <FormMessage>{errors.email}</FormMessage>
      </FormField>

      <FormField>
        <div className="flex items-center justify-between">
          <FormLabel required>Password</FormLabel>
          <Link
            href="/forgot-password"
            className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="••••••••"
        />
        <FormMessage>{errors.password}</FormMessage>
      </FormField>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold"
      >
        Sign In to Portal
      </Button>
    </form>
  );
}
