// export { auth as middleware } from "@/lib/auth" // Basic usage

// Or apply middleware logic conditionally
import { auth } from "@/lib/auth"
import type { NextRequest } from 'next/server'

export default auth((req: NextRequest & { auth: any }) => {
  // The `auth` function in lib/auth already handles redirection
  // based on the `authorized` callback.
  // You can add additional middleware logic here if needed.
  // For example, logging, header manipulation, etc.

  // console.log("ROUTE:", req.nextUrl.pathname)
  // console.log("SESSION:", req.auth)
})

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
