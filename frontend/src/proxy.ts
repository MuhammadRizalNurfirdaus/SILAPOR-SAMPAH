import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Database } from "@/types/database.types";

// Inisialisasi Upstash Redis (graceful fallback jika variabel lingkungan belum diisi)
let generalLimiter: Ratelimit | null = null;
let loginLimiter: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes("<id>")
) {
  try {
    const redis = Redis.fromEnv();
    generalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:general",
    });
    loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:login",
    });
  } catch (error) {
    console.warn("Upstash Redis initialization skipped:", error);
  }
}

const RULES: [string, string[]][] = [
  ["/sopir", ["sopir"]],
  ["/kabid", ["kabid", "admin"]],
  ["/admin", ["admin"]],
];

const HOME_ROLES: Record<string, string> = {
  sopir: "/sopir",
  kabid: "/kabid",
  admin: "/admin/armada",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Rate limiting
  if (generalLimiter && loginLimiter) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const isLogin = pathname.startsWith("/login");
    const isApi = pathname.startsWith("/api");

    if (isLogin || isApi) {
      const limiter = isLogin ? loginLimiter : generalLimiter;
      try {
        const { success, limit, remaining, reset } = await limiter.limit(ip);
        if (!success) {
          return new NextResponse("Terlalu banyak permintaan. Coba lagi nanti.", {
            status: 429,
            headers: {
              "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
              "X-RateLimit-Limit": String(limit),
              "X-RateLimit-Remaining": String(remaining),
            },
          });
        }
      } catch (error) {
        console.error("Rate limiting check error:", error);
      }
    }
  }

  // 2. Supabase Auth cookie handling
  let res = NextResponse.next({ request: req });
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Role-based routing guard
  const rule = RULES.find(([prefix]) => pathname.startsWith(prefix));

  // Jika mengunjungi /login dan sudah login, arahkan ke dashboard peran
  if (pathname === "/login") {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();
      if (p && p.is_active && HOME_ROLES[p.role]) {
        return NextResponse.redirect(new URL(HOME_ROLES[p.role], req.url));
      }
    }
    return res;
  }

  if (!rule) {
    return res;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: p } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!p || !p.is_active || !rule[1].includes(p.role)) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/login",
    "/aduan/:path*",
    "/sopir/:path*",
    "/kabid/:path*",
    "/admin/:path*",
  ],
};
