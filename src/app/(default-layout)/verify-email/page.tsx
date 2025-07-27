"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import authApiRequest from "@/api/auth";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    "pending"
  );
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No token provided.");
      return;
    }
    authApiRequest
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email has been verified successfully!");
      })
      .catch((err: any) => {
        setStatus("error");
        setMessage(
          err?.message ||
            "Verification failed. The link may be invalid or expired."
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === "pending" && (
          <>
            <div className="mb-4 animate-spin mx-auto w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">
              Verifying your email...
            </div>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <div className="text-xl font-bold text-green-700 mb-2">
              Email Verified!
            </div>
            <div className="text-gray-700 mb-4">{message}</div>
            <Button
              className="bg-blue-500 text-white"
              onClick={() => router.push("/profile")}
            >
              Done
            </Button>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-xl font-bold text-red-700 mb-2">
              Verification Failed
            </div>
            <div className="text-gray-700 mb-4">{message}</div>
          </>
        )}
      </div>
    </div>
  );
}

function VerifyEmailPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4 animate-spin mx-auto w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full"></div>
          <div className="text-lg font-semibold text-gray-700">
            Loading...
          </div>
        </div>
      </div>
    }>
      <VerifyEmailPage />
    </Suspense>
  );
}

export default VerifyEmailPageWrapper;
