const embedHosts = [
  "https://short.icu",
  "https://*.short.icu",
  "https://streamtape.com",
  "https://*.streamtape.com",
  "https://emturbovid.com",
  "https://*.emturbovid.com",
  "https://turbovidhls.com",
  "https://*.turbovidhls.com",
  "https://vidoza.net",
  "https://*.vidoza.net",
  "https://mxdrop.to",
  "https://*.mxdrop.to",
].join(" ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://image.tmdb.org https://static.tvmaze.com https://cdn.myanimelist.net https://hwztchapter.dramaboxdb.com",
      "font-src 'self' data:",
      "connect-src 'self' https://idflix.my.id https://api.sansekai.my.id https://dramabox.sansekai.my.id ws: wss:",
      `frame-src ${embedHosts}`,
      "media-src 'self' blob: https://*.dramaboxdb.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hwztchapter.dramaboxdb.com",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "static.tvmaze.com",
        pathname: "/uploads/images/**",
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
