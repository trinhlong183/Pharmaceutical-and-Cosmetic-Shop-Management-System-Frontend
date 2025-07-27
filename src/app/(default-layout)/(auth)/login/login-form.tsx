"use client";

import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import authApiRequest from "@/api/auth";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";

export default function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/"); // Redirect to home if already logged in
    }
  }, [user, loading, router]);
  if (user) return null;

  if (loading) return null; // Or a spinner
  async function onSubmit(values: LoginBodyType) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await authApiRequest.login(values);
      toast.success("Login successful!");
      if (result?.payload?.token) {
        localStorage.setItem("accessToken", result.payload.token);
        // Lấy profile và cập nhật context user
        const profile = await authApiRequest.myProfile();
        setUser(profile?.payload || null);
      }
      router.push("/");
    } catch (error: unknown) {
      console.log("Login error o login-form:", error);
      handleErrorApi({
        error,
        setError: form.setError,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    try {
      await authApiRequest.forgotPassword(forgotEmail);
      toast.success("Check your email for the reset link.");
      setShowForgot(false);
      setForgotEmail("");
    } catch (error) {
      toast.error(error?.message || "Failed to send reset email.");
    } finally {
      setForgotLoading(false);
    }
  }

  if (showForgot) {
    return (
      <Card className="shadow-lg border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="your@email.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={forgotLoading}
            >
              {forgotLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground border-t pt-4">
          <Button
            variant="link"
            className="p-0 text-blue-600"
            onClick={() => {
              setShowForgot(false);
              setForgotEmail("");
            }}
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-t-4 border-t-blue-600">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Sign In
        </CardTitle>
        <CardDescription className="text-center">
          Welcome back! Please login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-right mt-2">
          <Button
            variant="link"
            className="p-0 text-blue-600"
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm text-muted-foreground border-t pt-4">
        <div className="text-center">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-medium hover:underline"
          >
            Register here
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
