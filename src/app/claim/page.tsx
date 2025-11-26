'use client';

import React from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther } from 'ethers';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { stakeAbi } from '@/assets/abis/stake';
import { useEffect, useState } from 'react';

interface IClaimProps {}

/**
 * Claim页面组件
 * 功能：显示用户可领取的奖励信息，提供奖励领取功能
 */
const Claim: React.FunctionComponent<IClaimProps> = () => {
  // 用户账户状态
  const { address, isConnected } = useAccount();
  
  // 客户端挂载状态，用于解决Hydration失败问题
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 获取ETH矿池ID
  const { data: ethPoolId } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'ETH_PID',
  });
  
  // 获取用户可领取的奖励
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'pendingMetaNode',
    args: [ethPoolId || BigInt(0), address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && ethPoolId !== undefined && ethPoolId !== null,
    },
  });
  
  // 获取用户状态信息
  const { data: userInfo, refetch: refetchUserInfo } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'user',
    args: [ethPoolId || BigInt(0), address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && !!ethPoolId,
    },
  });
  
  // 发送交易钩子
  const { writeContract, data: writeData, isPending: isWriting } = useWriteContract();
  
  // 等待交易确认钩子
  const { isLoading: isConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  }); 
  
  // 计算是否正在处理交易
  const isPending = isWriting || isConfirming;
  
  // 使用useEffect监听交易状态变化
  React.useEffect(() => {
    if (isTxSuccess) {
      toast.success('奖励领取成功！');
      refetchPendingRewards(); // 刷新可领取奖励
      refetchUserInfo(); // 刷新用户状态
    }
  }, [isTxSuccess, refetchPendingRewards, refetchUserInfo]);
  
  /**
   * 处理奖励领取操作
   */
  const handleClaim = () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }
    
    if (ethPoolId === undefined || ethPoolId === null) {
      toast.error('无法获取矿池信息');
      return;
    }
    
    if (!pendingRewards || pendingRewards <= BigInt(0)) {
      toast.error('没有可领取的奖励');
      return;
    }
    
    try {
      // 调用合约的claim方法
      writeContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: 'claim',
        args: [ethPoolId],
      });
      toast.info('交易已提交，等待确认...');
    } catch (error) {
      console.error('领取奖励失败:', error);
      toast.error('领取奖励失败，请重试');
    }
  };
  
  // 格式化可领取奖励
  const formattedPendingRewards = pendingRewards ? formatEther(pendingRewards) : '0';
  console.log(userInfo, 'uuuuuuu');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-2">领取奖励</h1>
          <p className="text-violet-300">查看并领取您的质押奖励</p>
        </motion.div>
        
        {/* 奖励信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">您的奖励信息</h2>
          
          {/* 使用isClient状态解决Hydration失败问题 */}
          {isClient ? (
            isConnected ? (
              <div className="space-y-6">
                {/* 待领取奖励 */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-violet-300 text-sm mb-1">可领取的奖励</p>
                    <p className="text-3xl font-bold text-white">
                      {formattedPendingRewards} MetaNode
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-violet-300 text-sm mb-1">已获得总奖励</p>
                    <p className="text-xl font-semibold text-white">
                      {userInfo && userInfo[1] ? formatEther(userInfo[1]) : '0'} MetaNode
                    </p>
                  </div>
                </div>
                
                {/* 领取按钮 */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClaim}
                    disabled={isPending || !pendingRewards || pendingRewards <= BigInt(0)}
                    className={`px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
                      isPending
                        ? 'bg-violet-600/50 cursor-not-allowed'
                        : pendingRewards && pendingRewards > BigInt(0)
                        ? 'bg-violet-500 hover:bg-violet-400 cursor-pointer'
                        : 'bg-violet-600/50 cursor-not-allowed'
                    }`}
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>处理中...</span>
                      </div>
                    ) : (
                      '领取奖励'
                    )}
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-violet-300 text-lg">请先连接钱包查看您的奖励信息</p>
              </div>
            )
          ) : (
            // 服务器端渲染时显示加载状态
            <div className="text-center py-12">
              <p className="text-violet-300 text-lg">加载中...</p>
            </div>
          )}
        </motion.div>
        
        {/* 奖励说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">奖励说明</h3>
          <ul className="space-y-2 text-violet-200">
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>奖励会根据您的质押金额和质押时间自动计算</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>您可以随时领取已生成的奖励</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>领取奖励后，您的待领取奖励会重置为0</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>奖励以MetaNode代币形式发放</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Claim;
