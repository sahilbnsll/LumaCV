/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.alias.canvas = false;

    // pdfjs-dist is only used client-side; avoid bundling it on the server
    // and prevent Next.js from generating overly-long chunk paths that 404
    if (!isServer) {
      config.resolve.alias['pdfjs-dist'] = 'pdfjs-dist/build/pdf.min.js';
    }

    return config;
  },
};

export default nextConfig;
