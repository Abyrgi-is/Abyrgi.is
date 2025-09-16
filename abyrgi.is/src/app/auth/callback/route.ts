// In your app/supabase/route.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // We need to create a response object to handle potential cookie updates
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Create a Supabase client configured for Route Handlers
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // The response object is used to set cookies
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // The response object is used to delete cookies
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  // You can now use this Supabase client safely
  const { data: { user } } = await supabase.auth.getUser();

  // For API routes, you must return a Response object.
  // We pass the headers from our response object to ensure cookies are set.
  return NextResponse.json({ user }, { headers: response.headers });
}