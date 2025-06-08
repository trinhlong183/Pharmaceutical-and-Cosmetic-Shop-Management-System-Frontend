"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check user role from authentication system
    const userRole = localStorage.getItem("userRole") || "customer";

    // Redirect based on role
    switch (userRole) {
      case "admin":
        router.push("/dashboard");
        break;
      case "staff":
        router.push("/dashboard");
        break;
      default:
        router.push("/home");
        break;
    }
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
}
