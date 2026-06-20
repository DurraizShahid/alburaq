import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      new URL("https://cdn.fragella.com/**"),
      new URL("https://cdn.fragrancenet.com/**"),
      new URL("https://d2k6fvhyk5xgx.cloudfront.net/**"),
    ],
  },
};

export default nextConfig;
