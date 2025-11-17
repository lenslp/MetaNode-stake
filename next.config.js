/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: {
    autoPrerender: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // 禁用webpack缓存
      config.cache = false;
      // 配置热更新
      config.watchOptions = {
        poll: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  // 添加HTTP缓存控制头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
