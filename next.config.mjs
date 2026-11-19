import path from "node:path";

// Demo mode (npm run demo): swaps the Firestore store for an in-memory one
// with example data. Only ever on the development server.
const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
const REAL_STORE = path.resolve("src/lib/store");
const DEMO_STORE = path.resolve("src/lib/demoMode/store.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { dev, webpack }) => {
    if (DEMO && dev) {
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/store$/, (res) => {
          const req = res.request;
          const target = req === "@/lib/store" ? REAL_STORE : req.startsWith(".") ? path.resolve(res.context, req) : null;
          if (target === REAL_STORE && !res.context.includes("demoMode")) res.request = DEMO_STORE;
        })
      );
    }
    return config;
  },
};

export default nextConfig;
