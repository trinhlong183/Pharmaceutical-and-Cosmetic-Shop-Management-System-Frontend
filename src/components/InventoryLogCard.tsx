import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Product = {
  productId: { productName: string; price: number; id: string };
  quantity: number;
  _id?: string;
};
type User = { _id: string; email: string; fullName: string } | string;
type InventoryLogCardProps = {
  log: {
    _id: string;
    batch: string;
    products: Product[];
    action: string;
    status: string;
    userId: User;
    createdAt: string;
    updatedAt: string;
    reason?: string;
  };
};

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

const InventoryLogCard: React.FC<InventoryLogCardProps> = ({ log }) => {
  const status = statusStyles[log.status] ?? {
    color: "bg-slate-50 text-slate-700 border-slate-200",
    label: log.status || "Unknown",
    icon: "❓",
  };

  const grandTotal = log.products.reduce(
    (sum, p) => sum + p.quantity * p.productId.price,
    0
  );

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-8">
        {/* Request Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
              Batch ID
            </p>
            <p className="font-bold text-lg text-slate-800">{log.batch}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
              Action Type
            </p>
            <Badge
              variant="secondary"
              className="capitalize bg-blue-100 text-blue-800 font-semibold"
            >
              {log.action}
            </Badge>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
              Status
            </p>
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold border ${status.color}`}
            >
              {status.label}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2 lg:col-span-1">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
              Requested By
            </p>
            <p className="font-semibold text-slate-800">
              {typeof log.userId === "object"
                ? `${log.userId.fullName}`
                : log.userId}
            </p>
            {typeof log.userId === "object" && (
              <p className="text-sm text-slate-600">{log.userId.email}</p>
            )}
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">
              Request Date
            </p>
            <p className="font-semibold text-slate-800">
              {new Date(log.createdAt).toLocaleString([], {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Reason Section */}
        {log.reason && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-red-600 font-semibold mb-2 flex items-center gap-1">
              Reason for Denial
            </p>
            <p className="font-medium text-red-800">{log.reason}</p>
          </div>
        )}

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              📦 Products Overview
            </h3>
            <Badge variant="outline" className="bg-slate-100">
              {log.products.length} item{log.products.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="font-bold text-slate-700">
                    Product ID
                  </TableHead>
                  <TableHead className="font-bold text-slate-700">
                    Name
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">
                    Quantity
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">
                    Unit Price
                  </TableHead>
                  <TableHead className="font-bold text-slate-700 text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.products.map((p, index) => {
                  const total = p.quantity * p.productId.price;
                  return (
                    <TableRow
                      key={p._id || p.productId.id}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      <TableCell className="font-mono text-sm text-slate-600">
                        {p.productId.id}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {p.productId.productName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-700">
                        {p.quantity}
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {p.productId.price.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800">
                        {total.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD",
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Grand Total Row */}
                <TableRow className="bg-blue-100 hover:bg-blue-100 border-t-2 border-blue-200">
                  <TableCell
                    colSpan={4}
                    className="font-bold text-blue-800 text-right"
                  >
                    Grand Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-blue-900">
                    {grandTotal.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InventoryLogCard;
