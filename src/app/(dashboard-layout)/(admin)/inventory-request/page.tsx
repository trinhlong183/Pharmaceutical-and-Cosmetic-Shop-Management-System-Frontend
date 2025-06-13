import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import React from "react";

function InventoryReqest() {
  return (
    <RoleRoute allowedRoles={[Role.ADMIN]}>
      <div>InventoryReqest</div>
    </RoleRoute>
  );
}

export default InventoryReqest;
