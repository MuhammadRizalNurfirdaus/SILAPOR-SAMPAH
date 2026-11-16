import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

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

    // Batas umum: 60 request / menit / IP (Bab 3.3 framework.md)
    generalLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "rl:general",
    });

    // Batas ketat untuk login: 5 percobaan / menit / IP (Bab 3.3 framework.md)
    loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      prefix: "rl:login",
    });
  } catch (error) {
    console.warn("Upstash Redis initialization skipped:", error);
  }
}

export async function middleware(req: NextRequest) {
  if (!generalLimiter || !loginLimiter) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";

  const isLogin = req.nextUrl.pathname.startsWith("/login");
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
    // Jika layanan Redis tidak dapat dijangkau, izinkan permintaan agar sistem tidak down
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/login", "/aduan/:path*"],
};
