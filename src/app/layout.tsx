'use client';

import "./globals.css";

// 导入 wagmi 和 rainbowkit 相关库
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './wagmi';
import Header from '@/components/Header';
import { ToastContainer } from 'react-toastify';
import { useMemo } from 'react';

/**
 * 根布局组件
 * 集成Wagmi和RainbowKit提供Web3功能
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 使用useMemo确保所有配置只被创建一次，避免重复初始化
  const providers = useMemo(() => {
    const queryClient = new QueryClient();
    return { queryClient, config };
  }, []);
  
  return (
    <html lang="zh-CN">
      <body>
        {/* 提供Web3功能的上下文 */}
        <WagmiProvider config={providers.config}>
          <QueryClientProvider client={providers.queryClient}>
            <RainbowKitProvider coolMode>
              <ToastContainer />
              <Header />
              {children}
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
