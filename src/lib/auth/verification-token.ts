import { randomBytes } from "node:crypto";

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export const VERIFICATION_TOKEN_TTL_HOURS = 24;

export function isTokenExpired(sentAt: string | null): boolean {
  if (!sentAt) return true;
  const sentAtMs = new Date(sentAt).getTime();
  const ttlMs = VERIFICATION_TOKEN_TTL_HOURS * 60 * 60 * 1000;
  return Date.now() - sentAtMs > ttlMs;
}
