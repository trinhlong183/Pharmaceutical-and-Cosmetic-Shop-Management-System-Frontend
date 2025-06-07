"use client";

import { useUser } from "@/contexts/UserContext";
import { Role } from "@/constants/type";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function StaffRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Wait for user data to load
    if (loading) return;
    if (!user) {
      toast.error("You must be logged in to access this page");
      router.push("/login");
      return;
    }

    if (user.role !== Role.STAFF) {
      console.log("User:", user);
      console.log("Role", Role.STAFF);

      toast.error("You don't have permission to access this page");
      router.push("/");
    }
  }, [user, loading, router]);

  // Show nothing while loading or if unauthorized
  if (loading || !user || user.role !== Role.STAFF) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
