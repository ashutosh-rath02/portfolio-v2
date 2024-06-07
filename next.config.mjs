/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.builder.io", "res.cloudinary.com", "pbs.twimg.com"],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
