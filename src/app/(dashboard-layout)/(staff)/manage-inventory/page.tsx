"use client";
import React, { useEffect, useState } from "react";
import { inventoryService } from "@/api/inventoryService";
import {
  CreateInventoryLogBodyType,
  InventoryLogType,
  InventoryQueryParamsType,
} from "@/schemaValidations/inventory.schma";
import { useUser } from "@/contexts/UserContext";
import { Input } from "@/components/ui/input";
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

function ManageInventoryPage() {
  const [logs, setLogs] = useState<InventoryLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [filters, setFilters] = useState<
    Omit<InventoryQueryParamsType, "userId">
  >({});
  const [form, setForm] = useState<Omit<CreateInventoryLogBodyType, "userId">>({
    batch: "",
    products: [{ productId: "", quantity: 0 }],
    action: "import",
  });
  const [creating, setCreating] = useState(false);
  const [selectedLog, setSelectedLog] = useState<InventoryLogType | null>(null);

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

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters, user?.id]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value === "all" ? undefined : value,
    }));
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx?: number
  ) => {
    const { name, value } = e.target;
    if (name === "productId" || name === "quantity") {
      const products = [...form.products];
      if (idx !== undefined) {
        products[idx] = {
          ...products[idx],
          [name]: name === "quantity" ? Number(value) : value,
        };
        setForm({ ...form, products });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleActionChange = (value: string) => {
    setForm((prev) => ({ ...prev, action: value as "import" | "export" }));
  };

  const addProduct = () => {
    setForm({
      ...form,
      products: [...form.products, { productId: "", quantity: 0 }],
    });
  };

  const removeProduct = (idx: number) => {
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setCreating(true);
    try {
      await inventoryService.createInventoryLogs({
        ...form,
        userId: user.id,
      });
      setForm({
        batch: "",
        products: [{ productId: "", quantity: 0 }],
        action: "import",
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
    <RoleRoute allowedRoles={[Role.STAFF]}>
      <div className="max-w-4xl mx-auto py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Inventory Log</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Batch</Label>
                <Input
                  name="batch"
                  placeholder="Batch"
                  value={form.batch}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div>
                <Label>Action</Label>
                <Select value={form.action} onValueChange={handleActionChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="import">Import</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Products</Label>
                <div className="space-y-2">
                  {form.products.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        name="productId"
                        placeholder="Product ID"
                        value={p.productId}
                        onChange={(e) => handleFormChange(e, idx)}
                        required
                      />
                      <Input
                        name="quantity"
                        type="number"
                        placeholder="Quantity"
                        value={p.quantity}
                        onChange={(e) => handleFormChange(e, idx)}
                        required
                        min={0}
                      />
                      {form.products.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeProduct(idx)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addProduct}
                  >
                    Add Product
                  </Button>
                </div>
              </div>
              <Button type="submit" disabled={creating}>
                Create Inventory Log
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Filter Inventory Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-wrap gap-4 items-end">
              <div>
                <Label>Product ID</Label>
                <Input
                  placeholder="Product ID"
                  name="productId"
                  value={filters.productId || ""}
                  onChange={handleFilterChange}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={filters.status || "all"}
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
              <Button type="button" onClick={fetchLogs}>
                Search
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
