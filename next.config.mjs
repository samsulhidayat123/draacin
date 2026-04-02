/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hwztchapter.dramaboxdb.com",
      },
    ],
  },
};

export default nextConfig;