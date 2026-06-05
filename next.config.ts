import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: {
    // Isko 'bottom-right', 'top-left', ya 'top-right' par set kar ke position badlein
    position: 'top-right', 
  },
  compiler: {
  removeConsole: process.env.NODE_ENV === 'production',
},

  /* config options here */
};

export default nextConfig;
