"use client";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardStaff from "../(staff)/dashboard-staff";
import DashboardAdmin from "../(admin)/dashboard-admin";
import { Role } from "@/constants/type";
import RoleRoute from "@/components/auth/RoleRoute";

function Dashboard() {
  const { user } = useUser();

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <RoleRoute allowedRoles={[Role.ADMIN]}>
        <DashboardAdmin />
      </RoleRoute>
    );
  }

  return (
    <RoleRoute allowedRoles={[Role.STAFF]}>
      <DashboardStaff />
    </RoleRoute>
  );
}

export default Dashboard;
