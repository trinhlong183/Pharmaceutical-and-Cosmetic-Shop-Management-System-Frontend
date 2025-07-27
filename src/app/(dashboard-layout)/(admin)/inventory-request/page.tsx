"use client";
import React, { useEffect, useState } from "react";
import { inventoryService } from "@/api/inventoryService";
import {
  InventoryLogType,
  InventoryQueryParamsType,
} from "@/schemaValidations/inventory.schma";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { toast } from "sonner";

function InventoryRequest() {
  const [logs, setLogs] = useState<InventoryLogType[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<InventoryQueryParamsType>({});
  const [pendingFilters, setPendingFilters] =
    useState<InventoryQueryParamsType>({});
  const [selectedLog, setSelectedLog] = useState<InventoryLogType | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [reason, setReason] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await inventoryService.getAllInventoryLogs(filters);
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
      status: value === "all" ? undefined : (value as "pending" | "approved" | "denied"),
    }));
  };

  const getActionBadge = (action: string) => {
    if (action === "import")
      return (
        <Badge
          variant="secondary"
          className="capitalize bg-blue-100 text-blue-800 font-semibold"
        >
          Import
        </Badge>
      );
    if (action === "export")
      return (
        <Badge
          variant="secondary"
          className="capitalize bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold"
        >
          Export
        </Badge>
      );
  };
  const handleSearch = () => {
    setFilters({ ...pendingFilters });
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filters]);

  const handleApprove = async (logId: string) => {
    setReviewing(true);
    try {
      await inventoryService.reviewInventoryLogs(logId, { approved: true });
      toast.success("Inventory request approved successfully");
      setSelectedLog(null);
      fetchLogs();
    } catch (e) {
      handleErrorApi({ error: e });
    }
    setReviewing(false);
  };

  const handleDeny = async (logId: string) => {
    if (!reason.trim()) {
      return;
    }
    setReviewing(true);
    try {
      await inventoryService.reviewInventoryLogs(logId, {
        approved: false,
        reason,
      });
      toast.success("Inventory request denied");
      setSelectedLog(null);
      setReason("");
      setDenyModalOpen(false);
      fetchLogs();
    } catch (e) {
      handleErrorApi({ error: e });
    }
    setReviewing(false);
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 border-yellow-300"
          >
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 border-green-300"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "denied":
        return (
          <Badge
            variant="secondary"
            className="bg-red-100 text-red-800 border-red-300"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <RoleRoute allowedRoles={[Role.ADMIN]}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory Requests
          </h1>
          <p className="text-gray-600">
            Review and manage inventory requests from staff
          </p>
        </div>

        <Card className="mb-8 shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Filter Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              {/* <div className="space-y-2">
                <Label htmlFor="userId" className="text-sm font-medium">
                  User ID
                </Label>
                <Input
                  id="userId"
                  placeholder="Enter user ID"
                  name="userId"
                  value={pendingFilters.userId || ""}
                  onChange={handleFilterChange}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="productId" className="text-sm font-medium">
                  Product ID
                </Label>
                <Input
                  id="productId"
                  placeholder="Enter product ID"
                  name="productId"
                  value={pendingFilters.productId || ""}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Status
                </Label>
                <Select
                  value={pendingFilters.status || "all"}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Approved</SelectItem>
                    <SelectItem value="denied">Denied</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-lg">Inventory Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No inventory requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Staff</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">
                        Created At
                      </TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log, idx) => (
                      <React.Fragment key={idx}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            {getActionBadge(log.action)}
                          </TableCell>
                          <TableCell>
                            {typeof log.userId === "object"
                              ? (log.userId as { fullName?: string })?.fullName || "Unknown User"
                              : log.userId}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {log.createdAt
                              ? typeof log.createdAt === "string"
                                ? new Date(log.createdAt).toLocaleString()
                                : log.createdAt.toLocaleString()
                              : ""}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedLog(log);
                                setReason("");
                              }}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                        {selectedLog && selectedLog.id === log.id && (
                          <TableRow>
                            <TableCell colSpan={5} className="p-0">
                              <div className="p-4">
                                <InventoryLogCard log={selectedLog as unknown as { _id: string; batch: string; products: { productId: string; quantity: number; _id?: string }[]; action: string; status: string; userId: { _id: string; email: string; fullName: string } | string; createdAt: string; updatedAt: string; reason?: string; items: { _id: string; inventoryLogId: string; productId: { productName: string; price: number; id: string; stock: number }; quantity: number; expiryDate: string; price: number; createdAt: string; updatedAt: string }[] }} />
                                <div className="mt-6 flex gap-3 flex-wrap justify-end border-t pt-4">
                                  {selectedLog.status === "pending" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                        disabled={reviewing}
                                        onClick={() =>
                                          handleApprove(selectedLog.id!)
                                        }
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                                        disabled={reviewing}
                                        onClick={() => setDenyModalOpen(true)}
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Deny
                                      </Button>
                                    </>
                                  )}
                                  <Button
                                    variant="outline"
                                    onClick={() => setSelectedLog(null)}
                                  >
                                    Close
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={denyModalOpen} onOpenChange={setDenyModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">
                Deny Inventory Request
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for denying this request. This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Label htmlFor="rejection-reason" className="text-sm font-medium">
                Rejection Reason
              </Label>
              <Input
                id="rejection-reason"
                placeholder="Enter reason for denial"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full"
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDenyModalOpen(false);
                  setReason("");
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={reviewing || !reason.trim()}
                onClick={() => selectedLog?.id && handleDeny(selectedLog.id)}
                type="button"
              >
                {reviewing ? "Processing..." : "Confirm Deny"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleRoute>
  );
}

export default InventoryRequest;
