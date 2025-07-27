import z from "zod";

export const RegisterBody = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name is required"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: "Phone number must be at least 10 characters",
      }),
    address: z.string().optional(),
    dob: z.string().optional() || null,
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type RegisterBodyType = z.infer<typeof RegisterBody>;

export const LoginBody = z
  .object({
    email: z.string().min(1, { message: "Email is required" }).email({
      message: "Invalid email address",
    }),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })
  .strict();

export type LoginBodyType = z.TypeOf<typeof LoginBody>;



export const LoginRes = z.object({
  message: z.string(),
  token: z.string(),
  user: z.object({
    email: z.string(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    dob: z.string().nullable(),
  }),
});

export type LoginResType = z.infer<typeof LoginRes>;

export const RefreshTokenBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type RefreshTokenBodyType = z.TypeOf<typeof RefreshTokenBody>;

export const RefreshTokenRes = z.object({
  data: z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
  message: z.string(),
});

export type RefreshTokenResType = z.TypeOf<typeof RefreshTokenRes>;

export const LogoutBody = z
  .object({
    refreshToken: z.string(),
  })
  .strict();

export type LogoutBodyType = z.TypeOf<typeof LogoutBody>;


