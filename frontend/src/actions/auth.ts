"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.API_URL || "http://localhost:3001";

interface AuthResult {
  success: boolean;
  error?: string;
  fieldErrors?: { field: string; message: string }[];
}

/**
 * Parses Set-Cookie headers from Express and sets them in Next.js.
 */
async function forwardCookies(setCookieHeaders: string[]) {
  const cookieStore = await cookies();

  for (const cookieStr of setCookieHeaders) {
    const parts = cookieStr.split(";").map((p) => p.trim());
    const [nameValue] = parts;
    const [name, ...valueParts] = nameValue.split("=");
    const value = valueParts.join("=");

    const options: {
      path: string;
      httpOnly: boolean;
      sameSite: "lax";
      secure?: boolean;
      maxAge?: number;
    } = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    };

    for (const part of parts.slice(1)) {
      const [key, val] = part.split("=");
      const lowerKey = key.toLowerCase();
      if (lowerKey === "max-age") options.maxAge = parseInt(val);
      if (lowerKey === "path") options.path = val;
      if (lowerKey === "secure") options.secure = true;
    }

    cookieStore.set(name, value, options);
  }
}

export async function loginAction(data: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return {
      success: false,
      error: error.message || "Login failed",
      fieldErrors: error.errors,
    };
  }

  await forwardCookies(res.headers.getSetCookie());
  return { success: true };
}

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    return {
      success: false,
      error: error.message || "Registration failed",
      fieldErrors: error.errors,
    };
  }

  await forwardCookies(res.headers.getSetCookie());
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  // Call Express logout
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: [
        accessToken ? `access_token=${accessToken}` : "",
        refreshToken ? `refresh_token=${refreshToken}` : "",
      ]
        .filter(Boolean)
        .join("; "),
    },
  }).catch(() => {});

  // Clear cookies
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");

  redirect("/login");
}
