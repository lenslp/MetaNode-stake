'use client';

import "./globals.css";

// 导入 wagmi 和 rainbowkit 相关库
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';

// 创建查询客户端
const queryClient = new QueryClient();

/**
 * 根布局组件
 * 集成Wagmi和RainbowKit提供Web3功能
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 提供Web3功能的上下文 */}
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider coolMode>
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
