import { getServerSession } from "next-auth/next"
import authConfig from "./auth.config"

export const auth = () => getServerSession(authConfig)
