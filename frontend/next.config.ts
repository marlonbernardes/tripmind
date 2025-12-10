import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {},
  /* config options here */
  devIndicators: {
    position: "top-right", // top-right, bottom-right, top-left, bottom-left
  },
};

export default withPWA(nextConfig);
