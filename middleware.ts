import { createClient } from './utils/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request: any) {
  const { supabase, response } = createClient(request)

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/projects') ||
      request.nextUrl.pathname.startsWith('/ai-generator') ||
      request.nextUrl.pathname.startsWith('/admin')) {
    
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/projects/:path*',
    '/ai-generator/:path*',
    '/admin/:path*',
  ],
}
