/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true
  },
  transpilePackages: ["@ffmpeg/ffmpeg", "@ffmpeg/util"]
};

export default nextConfig;
