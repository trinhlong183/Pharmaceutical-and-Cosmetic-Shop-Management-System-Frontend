"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";

interface ConfirmReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function ConfirmReceiptDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: ConfirmReceiptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Confirm Order Receipt
          </DialogTitle>
          <DialogDescription>
            Please confirm that you have received your order in good condition.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start space-x-2 mb-4">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-yellow-800 text-sm">
              <p className="font-medium">Important:</p>
              <p>By confirming receipt, you acknowledge that:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>You have received all items in your order</li>
                <li>The items are in acceptable condition</li>
                <li>This will complete your order process</li>
              </ul>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2">
            If there are any issues with your order, please contact customer support before confirming receipt.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Yes, Confirm Receipt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
