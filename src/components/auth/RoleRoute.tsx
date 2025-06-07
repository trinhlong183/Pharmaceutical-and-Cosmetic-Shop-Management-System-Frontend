"use client";

import { useUser } from "@/contexts/UserContext";
import { Role } from "@/constants/type";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

export default function RoleRoute({ allowedRoles, children }: RoleRouteProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("You must be logged in to access this page");
      router.push("/login");
      return;
    }
    if (!allowedRoles.includes(user.role)) {
      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, loading, router, allowedRoles]);

  if (loading || !user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
