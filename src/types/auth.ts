/**
 * Authentication and User account types matching backend apps.accounts.
 */

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SALES_AGENT'
  | 'CUSTOMER'
  | 'B2B_PARTNER';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  role: UserRole;
  phone_number?: string;
  phone?: string;
  whatsapp_number?: string;
  is_verified?: boolean;
  date_joined?: string;
}


export interface UserProfile extends User {
  bio?: string;
  avatar_url?: string;
  nationality?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

export interface PasswordResetRequestPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordChangePayload {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface AuthTokens {
  access: string;
  refresh?: string;
}

export interface AuthResponse {
  user: User;
  tokens?: AuthTokens;
  message?: string;
}
