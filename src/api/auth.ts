import http from "@/lib/http";
import {
  LoginBodyType,
  RegisterBodyType,
  LoginResType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<{ status: number; payload: LoginResType }>("/auth/login", body),
  register: (body: RegisterBodyType) =>
    http.post<{ status: number; payload: LoginResType }>("/auth/register", body),
  myProfile: () => http.get<{ status: number }>("/auth/my-profile"),
  changePassword: (body: { currentPassword: string; newPassword: string }) =>
    http.patch<{ status: number }>("/auth/change-password", body),
  forgotPassword: (email: string) =>
    http.post("/auth/forgot-password", {
      email,
      isMobile: false,
    }),
  resetPassword: (token: string, newPassword: string) =>
    http.post("/auth/reset-password", { token, newPassword }),
  resendVerificationEmail: (email: string) =>
    http.post("/auth/resend-verification-email", { email }),
  verifyEmail: (token: string) => http.post("/auth/verify-email", { token }),
};

  
export default authApiRequest;
