import { NextRequest, NextResponse } from "next/server";
import { authRoutes, protectedRoutes } from "./routes";
import { JWT, parseJWT, validateJWT } from "oslo/jwt"
import { getPayloadSecret } from "./lib/edge/auth";

const checkIfLogged = async (req: NextRequest) => {
    const secret = await getPayloadSecret()
    const token = req.cookies.get('payload-token')?.value
    if (!secret || !token) return false
    try {
        const decoded = parseJWT(token) as (JWT) | null
        if (!decoded) return false
        const isValid = await validateJWT(
            decoded.algorithm,
            new TextEncoder().encode(secret),
            decoded.value,
        ).catch((err) => {
            console.error('Error validating JWT:', err)
            return false
        })
        if (!isValid) return false
        return true
    } catch (error) {
        return false
    }
}

export default async function middleware(req: NextRequest) {
    const { nextUrl } = req;
    const isLoggedIn = await checkIfLogged(req)

    const isApiRoute = nextUrl.pathname.startsWith("/api")
    const isProtectedRoute = protectedRoutes.some(route => nextUrl.pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => nextUrl.pathname.startsWith(route));

    if (isApiRoute) return NextResponse.next()

    if (isAuthRoute) {
        if (isLoggedIn) {
            return Response.redirect(new URL("/konto", nextUrl))
        }
        return NextResponse.next()
    }

    if (!isLoggedIn && isProtectedRoute) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) callbackUrl += nextUrl.search

        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
