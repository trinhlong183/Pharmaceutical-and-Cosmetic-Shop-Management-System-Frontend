import { ReactNode } from "react";
// import AdminSidebar from "@/components/admin/AdminSidebar";
// import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* <AdminSidebar /> */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* <AdminHeader /> */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
