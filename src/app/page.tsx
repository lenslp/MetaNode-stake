"use client";

import { useState } from "react";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { parseEther, formatEther } from "ethers";
import { toast } from "react-toastify";

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
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { sendTransaction, isPending, isSuccess } = useSendTransaction();

  /**
   * 截断地址显示
   * @param addr 完整的钱包地址
   * @returns 截断后的地址（如：0x1234...5678）
   */
  const truncateAddress = (addr?: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleSendTransaction = () => {
    if (!amount){
      return;
    }
    if(parseFloat(amount) > parseFloat(formatEther(balance!.value))){
      toast.error("余额不足");
      return;
    }
    sendTransaction({
      to: recipient as `0x${string}`,
      value: parseEther(amount),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 font-sans text-white">
      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
            欢迎使用 MetaNode DApp
          </h1>
          <p className="text-violet-200 text-lg max-w-2xl mx-auto">
            连接钱包，管理您的加密资产，参与质押并获取奖励
          </p>
        </div>
        
        {/* 连接状态和账户信息 */}
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-violet-400/50 transition-all">
            {isConnected ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white">
                  已连接钱包
                </h2>

                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-violet-300 text-sm font-medium mb-2">
                      钱包地址
                    </p>
                    <p className="font-mono text-lg text-white bg-white/10 p-2 rounded-lg">
                      {truncateAddress(address)}
                    </p>
                  </div>

                  {balance && (
                    <div>
                      <p className="text-violet-300 text-sm font-medium mb-2">
                        账户余额
                      </p>
                      <p className="font-mono text-lg text-white bg-white/10 p-2 rounded-lg">
                        {formatEther(balance.value)} ETH
                      </p>
                    </div>
                  )}
                </div>

                {/* 发送交易 */}
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-white">
                    发送 ETH
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="收款地址"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <input
                      type="text"
                      placeholder="发送金额 (ETH)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={handleSendTransaction}
                      disabled={!recipient || !amount || isPending}
                      className="w-full px-4 py-3 bg-violet-500 hover:bg-violet-400 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {isPending ? "发送中..." : "发送 ETH"}
                    </button>
                    {isSuccess && (
                      <div className="mt-2 p-3 rounded-lg bg-green-500/20 text-green-400 text-sm border border-green-500/30">
                        交易发送成功！
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <h2 className="text-2xl font-semibold text-white">
                  连接你的钱包
                </h2>

                <p className="text-violet-200">
                  点击右上角的连接按钮，开始使用 DApp
                </p>

                <div className="mt-4 p-6 rounded-lg border border-dashed border-white/20">
                  <p className="text-violet-300 text-sm">
                    支持的网络可通过右上角连接按钮查看和切换
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
