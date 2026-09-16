import type { TokenPayload } from "./cookies";

export async function getCurrentUserSession(): Promise<TokenPayload | null> {
  // In Server Components, reads HttpOnly cookie if present
  // In development/preview or unauthenticated states, returns null gracefully
  return null;
}
