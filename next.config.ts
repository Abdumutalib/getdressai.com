import type { NextConfig } from "next";
import createNextPWA from "next-pwa";

const withPWA = createNextPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  turbopack: {},
  async rewrites() {
    if (
      process.env.APP_MODE !== "external_server" &&
      process.env.NEXT_PUBLIC_APP_MODE !== "external_server"
    ) {
      return [];
    }

    const externalBaseUrl = process.env.EXTERNAL_API_BASE_URL;
    if (!externalBaseUrl) {
      return [];
    }

    const trimmedBaseUrl = externalBaseUrl.replace(/\/$/, "");

    return [
      {
        source: "/api/private/:path*",
        destination: `${trimmedBaseUrl}/api/private/:path*`,
      },
      {
        source: "/api/telegram/:path*",
        destination: `${trimmedBaseUrl}/api/telegram/:path*`,
      },
      {
        source: "/api/auth/me",
        destination: `${trimmedBaseUrl}/api/auth/me`,
      },
    ];
  },
};

export default withPWA(nextConfig);
