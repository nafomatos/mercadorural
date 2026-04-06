/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/anuncios",
        destination: "/buscar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
