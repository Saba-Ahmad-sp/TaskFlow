import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
  getCurrentUser,
  updateProfile,
} from "../services/auth.service";
import { env } from "../config/env";

const isProduction = env.NODE_ENV === "production";

function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe: boolean
) {
  // Access token: always 15 min persistent cookie
  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  // Refresh token: session cookie (no maxAge) or persistent (30 days)
  const refreshOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax";
    path: string;
    maxAge?: number;
  } = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
  };

  if (rememberMe) {
    refreshOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
  }
  // If not rememberMe, no maxAge → session cookie (cleared when browser closes)

  res.cookie("refresh_token", refreshToken, refreshOptions);
}

function clearTokenCookies(res: Response) {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}

// Express 5 auto-catches async errors — no try/catch needed

export async function register(req: Request, res: Response) {
  const { user, accessToken, refreshToken, rememberMe } = await registerUser(
    req.body
  );
  setTokenCookies(res, accessToken, refreshToken, rememberMe);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { user, accessToken, refreshToken, rememberMe } = await loginUser(
    req.body
  );
  setTokenCookies(res, accessToken, refreshToken, rememberMe);
  res.status(200).json({ user });
}

export async function refresh(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.refresh_token;
  if (!rawRefreshToken) {
    res.status(401).json({ message: "No refresh token provided" });
    return;
  }

  try {
    const { user, accessToken, refreshToken, rememberMe } =
      await refreshTokens(rawRefreshToken);
    setTokenCookies(res, accessToken, refreshToken, rememberMe);
    res.status(200).json({ user, message: "Tokens refreshed" });
  } catch (error) {
    clearTokenCookies(res);
    throw error; // re-throw for Express error handler
  }
}

export async function logout(req: Request, res: Response) {
  const rawRefreshToken = req.cookies?.refresh_token;
  await logoutUser(rawRefreshToken);
  clearTokenCookies(res);
  res.status(200).json({ message: "Logged out successfully" });
}

export async function me(req: Request, res: Response) {
  const user = await getCurrentUser(req.user!.userId);
  res.status(200).json({ user });
}

export async function updateMe(req: Request, res: Response) {
  const user = await updateProfile(req.user!.userId, req.body);
  res.status(200).json({ user });
}
