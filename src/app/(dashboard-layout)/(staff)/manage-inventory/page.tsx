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

function ManageInventoryPage() {
  const [logs, setLogs] = useState<InventoryLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [filters, setFilters] = useState<Omit<InventoryQueryParamsType, "userId">>({});
  const [creating, setCreating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<InventoryLogType | null>(null);
  const [pendingFilters, setPendingFilters] = useState<Omit<InventoryQueryParamsType, "userId">>({});

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
      await inventoryService.createInventoryLogs({
        ...form,
        userId: user.id,
      });
      fetchLogs();
      toast.success("Inventory log created successfully");
    } catch (e) {
      handleErrorApi({
        error: e,
      });
    }
    setCreating(false);
  };

  return (
    <RoleRoute allowedRoles={["staff", Role.STAFF]}>
      <div className="max-w-4xl mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Inventory Log</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateInventoryForm
              onSubmit={handleCreateInventory}
              loading={creating}
            />
          </CardContent>
        </Card>
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
                <Label>Product ID</Label>
                <Input
                  placeholder="Product ID"
                  name="productId"
                  value={pendingFilters.productId || ""}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label>Status</Label>
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
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit">Search</Button>
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
                      <TableHead>Batch</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Detail</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{log.batch}</TableCell>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.status}</TableCell>
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
                            onClick={() => setSelectedLog(log)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {selectedLog && (
                  <div className="mt-6">
                    <InventoryLogCard log={selectedLog as any} />
                    <div className="mt-2">
                      <Button size="sm" onClick={() => setSelectedLog(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleRoute>
  );
}

export default ManageInventoryPage;
