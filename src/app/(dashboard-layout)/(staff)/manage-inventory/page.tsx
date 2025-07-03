"use client";
import React, { useEffect, useState } from "react";
import { inventoryService } from "@/api/inventoryService";
import {
  CreateInventoryLogBodyType,
  InventoryLogType,
  InventoryQueryParamsType,
} from "@/schemaValidations/inventory.schma";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import InventoryLogCard from "@/components/InventoryLogCard";
import { handleErrorApi } from "@/lib/utils";
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import { toast } from "sonner";
import CreateInventoryForm from "./create-inventory-form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function ManageInventoryPage() {
  const [logs, setLogs] = useState<InventoryLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [filters, setFilters] = useState<
    Omit<InventoryQueryParamsType, "userId">
  >({});
  const [creating, setCreating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<InventoryLogType | null>(null);
  const [pendingFilters, setPendingFilters] = useState<
    Omit<InventoryQueryParamsType, "userId">
  >({});
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchLogs = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await inventoryService.getAllInventoryLogs({
        ...filters,
        userId: user.id,
      });
      setLogs(res);
    } catch (e) {
      handleErrorApi({
        error: e,
      });
    }
    setLoading(false);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPendingFilters({ ...pendingFilters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setPendingFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
    }));
  };

  const handleSearch = () => {
    setFilters({ ...pendingFilters }); // clone to trigger useEffect
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters, user?.id]);

  // Tách logic tạo inventory log ra ngoài
  const handleCreateInventory = async (
    form: Omit<CreateInventoryLogBodyType, "userId">
  ) => {
    if (!user?.id) return;
    setCreating(true);
    try {
      const res = await inventoryService.createInventoryLogs({
        ...form,
        userId: user.id,
      });
      console.log(res.payload);
      if (res.payload.errorCode === 400) {
        toast.error(res.payload.message || "Failed to create inventory log", {
          duration: 10000,
          dismissible: true,
        });
      } else {
        fetchLogs();
        toast.success("Inventory log created successfully");
        setCreateModalOpen(false);
      }
    } catch (e) {
      handleErrorApi({
        error: e,
      });
    }
    setCreating(false);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, { color: string; label: string }> = {
      pending: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        label: "Pending",
      },
      completed: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        label: "Approved",
      },
      denied: {
        color: "bg-red-50 text-red-700 border-red-200",
        label: "Denied",
      },
    };

    const style = statusStyles[status] ?? {
      color: "bg-slate-50 text-slate-700 border-slate-200",
      label: status || "Unknown",
    };

    return (
      <div
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${style.color}`}
      >
        {style.label}
      </div>
    );
  };

  return (
    <RoleRoute allowedRoles={["staff", Role.STAFF]}>
      <div className="max-w-8xl mx-auto">
        {/* Modal for create form */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent
            className="w-full max-w-4xl p-0"
            style={{
              left: "85%",
              top: "95%",
              transform: "translate(-50%, -50%)",
              position: "fixed",
              margin: 0,
              padding: 0,
              borderRadius: 20,
              maxWidth: "70%",
              maxHeight: "95vh",
              width: "100%",
              height: "95vh",
              overflowY: "auto",
              background: "white",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DialogHeader className="p-6 border-b">
              <DialogTitle>Create Inventory Log</DialogTitle>
            </DialogHeader>
            <div className="flex-1 flex flex-col px-4">
              <CreateInventoryForm
                onSubmit={async (form) => {
                  await handleCreateInventory(form);
                }}
                loading={creating}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Inventory Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-wrap gap-4 items-end"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div>
                <Label className="mb-2">Product ID</Label>
                <Input
                  placeholder="Product ID"
                  name="productId"
                  value={pendingFilters.productId || ""}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label className="mb-2">Status</Label>
                <Select
                  value={pendingFilters.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Search</Button>
              <Button
                className="ml-4"
                onClick={() => setCreateModalOpen(true)}
                type="button"
              >
                + Create Log
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, idx) => (
                      <React.Fragment key={idx}>
                        <TableRow>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="capitalize bg-blue-100 text-blue-800 font-semibold"
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(log.status || "unknown")}
                          </TableCell>
                          <TableCell>
                            {log.createdAt
                              ? typeof log.createdAt === "string"
                                ? new Date(log.createdAt).toLocaleString()
                                : log.createdAt.toLocaleString()
                              : ""}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setSelectedLog(
                                  selectedLog?._id === log._id ? null : log
                                )
                              }
                            >
                              {selectedLog?._id === log._id ? "Hide" : "View"}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {selectedLog && selectedLog._id === log._id && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-4 bg-gray-50">
                                <InventoryLogCard log={selectedLog as any} />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleRoute>
  );
}

export default ManageInventoryPage;
