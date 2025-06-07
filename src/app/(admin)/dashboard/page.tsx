import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import React from "react";

function Dashboard() {
  return (
    <>
      <RoleRoute allowedRoles={[Role.ADMIN, Role.STAFF]}>
        <div>Dashboard</div>
      </RoleRoute>
    </>
  );
}

export default Dashboard;
