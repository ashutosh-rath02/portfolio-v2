/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.builder.io", "res.cloudinary.com"],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
};

export default nextConfig;
