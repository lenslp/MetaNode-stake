"use client";

import React, { useState } from "react";
import {
  useAccount,
  useBalance,
  useWaitForTransactionReceipt,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "ethers";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { stakeAbi } from '@/assets/abis/stake';

interface IStakeProps {}

/**
 * 质押页面组件
 * 功能：显示平台简介、用户质押信息、提供ETH质押表单
 */
const Stake: React.FunctionComponent<IStakeProps> = () => {
  // 用户账户状态
  const { address, isConnected } = useAccount();
  // 钱包余额
  const { data: balanceData } = useBalance({
    address,
  });

  // 获取用户质押余额
  const { data: stakedBalance, refetch: refetchStakingBalance } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    args: [BigInt(0), address as `0x${string}`], // 将数字转换为bigint，确保address不为undefined
    functionName: 'stakingBalance',
    query: {
      enabled: isConnected && !!address
    }
  });

  // 发送交易钩子
  const { writeContract, data: writeData, isPending: isWriting } = useWriteContract();

  // 等待交易确认钩子
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });
  
  // 使用useEffect监听交易状态变化
  React.useEffect(() => {
    if (isTxSuccess) {
      toast.success("质押成功！");
      refetchStakingBalance(); // 刷新质押余额
      setIsSuccess(false);
    }
  }, [isTxSuccess, refetchStakingBalance]);

  // 状态管理
  const [stakeAmount, setStakeAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 使用从合约读取的真实数据
  const stakingBalance = stakedBalance ? `${formatEther(stakedBalance)} ETH` : "0 ETH";
  
  // 计算是否正在处理交易
  const isPending = isWriting || isConfirming;

  /**
   * 处理质押金额输入变化
   */
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许数字和小数点
    if (/^\d*\.?\d*$/.test(value)) {
      setStakeAmount(value);
    }
  };

  /**
   * 处理质押操作
   */
  const handleStake = () => {
    if (!isConnected || !address) {
      toast.error("请先连接钱包");
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("请输入有效的质押金额");
      return;
    }

    const amountInEther = parseFloat(stakeAmount);
    if (balanceData && amountInEther > parseFloat(formatEther(balanceData.value))) {
      toast.error("余额不足");
      return;
    }

    try {
      // 调用合约的depositETH方法
      writeContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: "depositETH",
        value: parseEther(stakeAmount), // 传递质押金额
      });
      
      toast.info("交易已提交，等待确认...");
      setIsSuccess(true);
      setStakeAmount("");
    } catch (error) {
      console.error("质押失败:", error);
      toast.error("质押失败，请重试");
    }
  };

  /**
   * 处理最大金额按钮点击
   */
  const handleMaxAmount = () => {
    if (balanceData) {
      // 留出一点ETH作为gas费
      const maxAmount = (parseFloat(formatEther(balanceData.value))).toFixed(6);
      setStakeAmount(maxAmount);
    }
  };

  // 页面动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 text-white">
      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* 页面标题 */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
              质押 ETH 获取奖励
            </h1>
            <p className="text-violet-200 text-lg max-w-2xl mx-auto">
              参与 MetaNode 质押平台，锁定您的 ETH
              并获得稳定收益。操作简单，收益透明。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 已质押金额卡片 */}
            <motion.div
              variants={itemVariants}
              className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 hover:border-violet-400/50 transition-all hover:shadow-lg hover:shadow-violet-500/10"
            >
              <h3 className="text-violet-300 text-sm font-medium mb-2">
                已质押金额
              </h3>
              <p className="text-2xl font-bold">{stakingBalance}</p>
            </motion.div>
          </div>

          {/* 质押表单 */}
          <motion.div
            variants={itemVariants}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-8 border border-white/10 hover:border-violet-400/50 transition-all"
          >
            <h2 className="text-2xl font-bold mb-6">质押 ETH</h2>

            <div className="mb-6">
              <label htmlFor="stakeAmount" className="block text-violet-200 mb-2">
                质押金额 (ETH)
              </label>
              <div className="flex gap-2">
                <input
                  id="stakeAmount"
                  type="text"
                  value={stakeAmount}
                  onChange={handleAmountChange}
                  placeholder="0.0"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-400 text-white placeholder-violet-300"
                />
                <button
                  onClick={handleMaxAmount}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    !isConnected || !balanceData || isPending
                  }
                >
                  最大
                </button>
              </div>
            </div>

            <button
              onClick={handleStake}
              className={`w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
              disabled={
                !isConnected ||
                !stakeAmount ||
                parseFloat(stakeAmount) <= 0 ||
                isPending
              }
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></div>
                  <span>处理中...</span>
                </div>
              ) : (
                "确认质押"
              )}
            </button>
          </motion.div>

          {/* 成功提示 */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-green-900/30 border border-green-500/30 rounded-lg text-green-300"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>质押交易已提交，等待确认...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default Stake;
