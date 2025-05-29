import http from "@/lib/http";
import {
  LoginBodyType,
  RegisterBodyType,
  LoginResType,
} from "@/schemaValidations/auth.schema";
import { My_Soul } from "next/font/google";

const authApiRequest = {
  login: (body: LoginBodyType) =>
    http.post<{ status: number; payload: LoginResType }>("/auth/login", body),
  register: (body: RegisterBodyType) =>
    http.post<{ status: number; payload: any }>("/auth/register", body),
  myProfile: () =>
    http.get<{ status: number}>("/auth/my-profile"),
};

export default authApiRequest;
