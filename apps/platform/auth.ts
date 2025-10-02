import { getServerSession } from "next-auth"
import authConfig from "./auth.config"

/**
 * Använd i server actions / route handlers:
 *   const session = await auth()
 */
export function auth() {
  return getServerSession(authConfig)
}

export type { DefaultSession } from "next-auth"
