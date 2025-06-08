"use client";
import React from "react";
import { useUser } from "@/contexts/UserContext";
import DashboardStaff from "../(staff)/dashboard-staff"; // import trang staff
import DashboardAdmin from "../(admin)/dashboard-admin"; // bạn cần tạo component này hoặc đổi tên cho phù hợp

function Dashboard() {
  const { user } = useUser();

  if (!user) return null; // hoặc loading...

  if (user.role === "admin") {
    return <DashboardAdmin />;
  }

  return <DashboardStaff />;
}

export default Dashboard;
