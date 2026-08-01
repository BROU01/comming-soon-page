import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfkit charge ses fichiers de polices (.afm) depuis le disque au
  // runtime — il ne doit pas être bundlé par Next.js (sinon ENOENT).
  serverExternalPackages: ["pdfkit"],
};

export default nextConfig;
