import React from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </>
  );
}
