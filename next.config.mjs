/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.builder.io"],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
