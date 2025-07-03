'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { transactionService, Transaction } from '@/api/transaction';
import RoleRoute from "@/components/auth/RoleRoute";
import { Role } from "@/constants/type";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatCurrency } from '@/lib/utils';



// Format date from string like "20250613082630" to readable format
const formatPayDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  
  try {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const hour = dateStr.substring(8, 10);
    const minute = dateStr.substring(10, 12);
    const second = dateStr.substring(12, 14);
    
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  } catch (error) {
    return 'Invalid date';
  }
};

const TransactionAdmin = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await transactionService.getAllTransactions();
        // Make sure we're handling the response correctly
        if (result && result.transactions) {
          setTransactions(result.transactions);
          setTotalItems(result.total);
        } else {
          console.error("Unexpected response format", result);
          setTransactions([]);
          setTotalItems(0);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        setTransactions([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  // Custom pagination logic for client-side since we're getting all data at once
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);

  // Status badge variant mapper
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'success':
        return "default";
      case 'pending':
        return "secondary";
      default:
        return "destructive";
    }
  };

  return (
    <RoleRoute allowedRoles={[Role.ADMIN]}>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Transaction Management</CardTitle>
            <CardDescription>View and manage all payment transactions</CardDescription>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>A list of your transactions</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Order ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Transaction No</TableHead>
                        <TableHead>Bank</TableHead>
                        <TableHead>Card Type</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center">No transactions found</TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction._id}>
                            <TableCell className="font-medium">
                              <Button variant="link" className="p-0 h-auto">{transaction.orderId}</Button>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(transaction.status)}>
                                {transaction.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatCurrency(transaction.totalAmount)}</TableCell>
                            <TableCell>{transaction.paymentMethod}</TableCell>
                            <TableCell>{transaction.paymentDetails.transactionNo || 'N/A'}</TableCell>
                            <TableCell>{transaction.paymentDetails.bankCode || 'N/A'}</TableCell>
                            <TableCell>{transaction.paymentDetails.cardType || 'N/A'}</TableCell>
                            <TableCell>{formatPayDate(transaction.paymentDetails.payDate)}</TableCell>
                            <TableCell>
                              <span title={new Date(transaction.createdAt).toLocaleDateString('vi-VN')}>
                                {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination controls */}
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-muted-foreground">
                      Rows per page
                    </p>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={pageSize.toString()} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 50].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleRoute>
  );
};

export default TransactionAdmin;
