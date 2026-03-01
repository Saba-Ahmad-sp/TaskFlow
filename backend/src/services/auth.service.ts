import { prisma } from "../lib/prisma";
import { hashPassword, comparePassword } from "../lib/password";
import {
  signAccessToken,
  generateRefreshToken,
  hashToken,
} from "../lib/jwt";
import { env } from "../config/env";
import { AppError } from "../middleware/error-handler";
import type { RegisterInput, LoginInput } from "../schemas/auth.schema";

function getRefreshTokenExpiry(rememberMe: boolean): Date {
  const expiry = new Date();
  if (rememberMe) {
    expiry.setDate(expiry.getDate() + 30); // 30 days for "Remember me"
  } else {
    expiry.setDate(expiry.getDate() + 1); // 1 day for session
  }
  return expiry;
}

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, "Email already registered");
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
    select: { id: true, name: true, email: true },
  });

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(false),
    },
  });

  return { user, accessToken, refreshToken, rememberMe: false };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isValid = await comparePassword(input.password, user.password);

  if (!isValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const rememberMe = input.rememberMe ?? false;

  const accessToken = signAccessToken({ userId: user.id, email: user.email });
  const refreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(rememberMe),
    },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken,
    refreshToken,
    rememberMe,
  };
}

export async function refreshTokens(rawRefreshToken: string) {
  const tokenHash = hashToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
    if (storedToken && !storedToken.revokedAt) {
      // Token expired but not revoked — clean it up
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });
    }
    throw new AppError(401, "Invalid or expired refresh token");
  }

  // Revoke the old refresh token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Determine if this was a "remember me" session (long-lived = > 2 days expiry from creation)
  const originalLifetimeMs = storedToken.expiresAt.getTime() - storedToken.createdAt.getTime();
  const wasRememberMe = originalLifetimeMs > 2 * 24 * 60 * 60 * 1000;

  // Issue new tokens
  const accessToken = signAccessToken({
    userId: storedToken.user.id,
    email: storedToken.user.email,
  });
  const newRefreshToken = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(newRefreshToken),
      userId: storedToken.user.id,
      expiresAt: getRefreshTokenExpiry(wasRememberMe),
    },
  });

  return {
    user: storedToken.user,
    accessToken,
    refreshToken: newRefreshToken,
    rememberMe: wasRememberMe,
  };
}

export async function logoutUser(rawRefreshToken: string) {
  if (!rawRefreshToken) return;

  const tokenHash = hashToken(rawRefreshToken);

  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function updateProfile(userId: string, data: { name: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name },
    select: { id: true, name: true, email: true },
  });
  return user;
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
}
