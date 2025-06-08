"use client";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardStaff from "../(staff)/dashboard-staff";
import DashboardAdmin from "../(admin)/dashboard-admin";

function Dashboard() {
  const { user } = useUser();

  if (!user) return null;

  if (user.role === "admin") {
    return <DashboardAdmin />;
  }

  return <DashboardStaff />;
}

export default Dashboard;
