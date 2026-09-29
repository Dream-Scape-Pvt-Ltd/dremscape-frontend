export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "guide" | "admin";
  nationality?: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
