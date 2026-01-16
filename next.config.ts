import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 
   * Vercel 部署优化配置
   * 注意：在 Vercel 上不需要 output: 'standalone'，它会自动处理。
   * 但保留它也不会报错，为了兼容 VPS 迁移我们暂时保留或注释掉。
   */
  // output: 'standalone', 

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'sample-videos.com',
      },
      // 商业化后建议添加 Supabase Storage 的域名
      // {
      //   protocol: 'https',
      //   hostname: 'your-project-ref.supabase.co',
      // },
    ],
    // 商业化优化：设置图片缓存时间，减少源站宽带消耗
    minimumCacheTTL: 60, 
  },

  // 商业化优化：添加安全请求头
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY', // 防止被恶意网站 iframe 嵌入
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;