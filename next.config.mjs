import { build } from "velite";

/** @type {import('next').NextConfig} */
export default {
  // othor next config here...
  webpack: (config) => {
    config.plugins.push(new VeliteWebpackPlugin());
    return config;
  },
  images: {
    domains: ["cdn.builder.io", "res.cloudinary.com", "pbs.twimg.com"],
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
  },
  // Reading notes are static pages in public/notes. These rewrites give them
  // clean URLs (/notes, /notes/<book>, /notes/<book>/ch1). Real files such as
  // /notes/assets/notes.css are matched first, so assets are unaffected.
  async rewrites() {
    return [
      { source: "/notes", destination: "/notes/index.html" },
      { source: "/notes/:book", destination: "/notes/:book/index.html" },
      {
        source: "/notes/:book/:chapter",
        destination: "/notes/:book/:chapter/index.html",
      },
    ];
  },
};

class VeliteWebpackPlugin {
  static started = false;
  constructor(/** @type {import('velite').Options} */ options = {}) {
    this.options = options;
  }
  apply(/** @type {import('webpack').Compiler} */ compiler) {
    // executed three times in nextjs !!!
    // twice for the server (nodejs / edge runtime) and once for the client
    compiler.hooks.beforeCompile.tapPromise("VeliteWebpackPlugin", async () => {
      if (VeliteWebpackPlugin.started) return;
      VeliteWebpackPlugin.started = true;
      const dev = compiler.options.mode === "development";
      this.options.watch = this.options.watch ?? dev;
      this.options.clean = this.options.clean ?? !dev;
      await build(this.options); // start velite
    });
  }
}
