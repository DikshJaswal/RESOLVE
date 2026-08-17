import bcrypt from "bcrypt";
import {
  createUser,
  findUserByEmail,
  findUserById,
} from "../models/user.model";
import crypto from "crypto";
import {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
} from "../models/refreshToken.model";
import {
  generateRefreshToken,
  verifyRefreshToken,
  generateAccessToken,
} from "../utils/jwt";

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  email = email.trim().toLowerCase();
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const userId = await createUser(name, email, passwordHash);

  return {
    id: userId,
    name,
    email,
    role: "CUSTOMER",
  };
}

export async function loginUser(email: string, password: string) {
  email = email.trim().toLowerCase();
  const user = await findUserByEmail(email);

  if (!user || !user.is_active) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
  });

  const refreshTokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await saveRefreshToken(user.id, refreshTokenHash, expiresAt);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await findRefreshToken(tokenHash);

  if (!storedToken) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  if (new Date(storedToken.expires_at).getTime() < Date.now()) {
    await deleteRefreshToken(tokenHash);

    throw new Error("INVALID_REFRESH_TOKEN");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    await deleteRefreshToken(tokenHash);

    throw new Error("INVALID_REFRESH_TOKEN");
  }

  if (
    typeof decoded !== "object" ||
    decoded === null ||
    typeof decoded.userId !== "number" ||
    !["CUSTOMER", "AGENT", "ADMIN"].includes(decoded.role)
  ) {
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  if (decoded.userId !== storedToken.user_id) {
    await deleteRefreshToken(tokenHash);
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const user = await findUserById(storedToken.user_id);
  if (!user || !user.is_active) {
    await deleteRefreshToken(tokenHash);
    throw new Error("INVALID_REFRESH_TOKEN");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  const nextRefreshToken = generateRefreshToken({
    userId: user.id,
    role: user.role,
  });
  await deleteRefreshToken(tokenHash);
  await saveRefreshToken(
    user.id,
    hashToken(nextRefreshToken),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  );

  return { accessToken, refreshToken: nextRefreshToken };
}

export async function logoutUser(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);

  await deleteRefreshToken(tokenHash);
}
