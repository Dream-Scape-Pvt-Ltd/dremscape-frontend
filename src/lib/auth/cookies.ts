export const AUTH_COOKIE_NAMES = {
  accessToken: "dst_access_token",
  refreshToken: "dst_refresh_token",
} as const;

export interface TokenPayload {
  userId: string;
  email: string;
  role: "customer" | "guide" | "admin";
  exp: number;
}
