"use client";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardStaff from "../(staff)/dashboard-staff";
import AdminDashboard from "../(admin)/dashboard-admin";
import { Role } from "@/constants/type";
import RoleRoute from "@/components/auth/RoleRoute";

function Dashboard() {
  const { user } = useUser();

  if (!user) return null;

  if (user.role === "admin") {
    return (
      <RoleRoute allowedRoles={[Role.ADMIN]}>
        <AdminDashboard />
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
