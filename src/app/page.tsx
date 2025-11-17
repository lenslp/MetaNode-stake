"use client"

export const dynamic = 'force-dynamic';

import Image from "next/image";
import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useSendTransaction } from 'wagmi';
import { parseEther, formatEther } from 'viem';

/**
 * 首页组件
 * 展示钱包连接功能和账户信息
 */
export default function Home() {
  // 使用 wagmi 的 useAccount 钩子获取账户信息
  const { address, isConnected } = useAccount();
  
  // 使用 wagmi 的 useBalance 钩子获取账户余额
  const { data: balance } = useBalance({
    address,
  });
  
  // 交易发送相关状态和钩子
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const { sendTransaction, isPending, isSuccess } = useSendTransaction();

  /**
   * 截断地址显示
   * @param addr 完整的钱包地址
   * @returns 截断后的地址（如：0x1234...5678）
   */
  const truncateAddress = (addr?: string) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-between bg-zinc-50 font-sans dark:bg-black p-6">
      {/* 顶部导航栏 */}
      <header className="flex w-full justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <Image
            src="/next.svg"
            alt="Next.js logo"
            width={80}
            height={16}
            priority
          />
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">DApp Demo</span>
        </div>
        
        {/* RainbowKit 连接按钮 */}
        <ConnectButton />
      </header>

      {/* 主要内容 */}
      <main className="flex flex-col items-center justify-center gap-8 text-center">
        <h1 className="text-4xl font-bold text-zinc-800 dark:text-white">
          Web3 DApp 学习示例
        </h1>
        
        <p className="max-w-md text-lg text-zinc-600 dark:text-zinc-300">
          基于 Next.js 14、React 18、Wagmi 和 RainbowKit 构建的去中心化应用示例
        </p>

        {/* 连接状态和账户信息 */}
        <div className="mt-8 rounded-xl bg-white p-8 shadow-lg dark:bg-zinc-900 max-w-md w-full">
          {isConnected ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                已连接钱包
              </h2>
              
              <div className="flex flex-col gap-3 text-left">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">地址</p>
                  <p className="font-mono text-lg text-zinc-800 dark:text-white">
                    {truncateAddress(address)}
                  </p>
                </div>
                
                {balance && (
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">余额</p>
                    <p className="font-mono text-lg text-zinc-800 dark:text-white">
                      {formatEther(balance.value)} ETH
                    </p>
                  </div>
                )}
              </div>

              {/* 发送交易 */}
              <div className="mt-4 space-y-4">
                <h3 className="text-lg font-medium text-zinc-800 dark:text-white">发送 ETH</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="收款地址"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="发送金额 (ETH)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      sendTransaction({
                        to: recipient as `0x${string}`,
                        value: parseEther(amount),
                      });
                    }}
                    disabled={!recipient || !amount || isPending}
                    className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? '发送中...' : '发送 ETH'}
                  </button>
                  {isSuccess && (
                    <div className="mt-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm">
                      交易发送成功！
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-zinc-800 dark:text-white">
                连接你的钱包
              </h2>
              
              <p className="text-zinc-600 dark:text-zinc-300">
                点击右上角的连接按钮，开始使用 DApp
              </p>
              
              <div className="mt-6 p-4 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持的网络可通过右上角连接按钮查看和切换
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="mt-16 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>使用 Next.js, React, Wagmi 和 RainbowKit 构建</p>
      </footer>
    </div>
  );
}
