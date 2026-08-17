import jwt from "jsonwebtoken";

type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

interface TokenPayload {
  userId: number;
  role: UserRole;
}

export function generateAccessToken(payload: TokenPayload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "15m",
  });
}

export function generateRefreshToken(payload: TokenPayload) {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token: string) {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return jwt.verify(token, secret);
}
