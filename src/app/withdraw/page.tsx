'use client';

import React, { useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { formatEther, parseEther } from 'ethers';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { stakeAbi } from '@/assets/abis/stake';

interface IWithdrawProps {}

/**
 * Withdraw页面组件
 * 功能：显示用户可提现余额，提供提现功能，增加Unstake功能
 */
const Withdraw: React.FunctionComponent<IWithdrawProps> = () => {
  // 用户账户状态
  const { address, isConnected } = useAccount();
  
  // 获取ETH矿池ID
  const { data: ethPoolId } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'ETH_PID',
  });
  
  // 获取用户可提现余额
  const { 
    data: withdrawAmountData, 
    refetch: refetchWithdrawAmount 
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'withdrawAmount',
    args: [ethPoolId || BigInt(0), address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && ethPoolId !== undefined && ethPoolId !== null,
    },
  });
  
  // 获取用户质押余额
  const { 
    data: stakedAmount, 
    refetch: refetchStakedAmount 
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
    abi: stakeAbi,
    functionName: 'stakingBalance',
    args: [ethPoolId || BigInt(0), address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && ethPoolId !== undefined && ethPoolId !== null,
    },
  });
  
  // Withdraw交易
  const { 
    writeContract: withdrawWriteContract, 
    data: withdrawWriteData, 
    isPending: isWithdrawWriting 
  } = useWriteContract();
  
  // Unstake交易
  const { 
    writeContract: unstakeWriteContract, 
    data: unstakeWriteData, 
    isPending: isUnstakeWriting 
  } = useWriteContract();
  
  // 等待Withdraw交易确认
  const { 
    isLoading: isWithdrawConfirming, 
    isSuccess: isWithdrawTxSuccess 
  } = useWaitForTransactionReceipt({
    hash: withdrawWriteData,
  }); 
  
  // 等待Unstake交易确认
  const { 
    isLoading: isUnstakeConfirming, 
    isSuccess: isUnstakeTxSuccess 
  } = useWaitForTransactionReceipt({
    hash: unstakeWriteData,
  }); 
  
  // 计算各功能是否正在处理交易
  const isWithdrawPending = isWithdrawWriting || isWithdrawConfirming;
  const isUnstakePending = isUnstakeWriting || isUnstakeConfirming;
  // 全局交易状态，用于刷新数据
  const isAnyTxSuccess = isWithdrawTxSuccess || isUnstakeTxSuccess;
  
  // Unstake金额输入状态
  const [unstakeAmount, setUnstakeAmount] = useState<string>('');
  // Withdraw金额输入状态
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  // 可提现金额（用于MAX按钮）
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<string>('');
  
  // 监听交易状态变化
  React.useEffect(() => {
    if (isAnyTxSuccess) {
      refetchWithdrawAmount(); // 刷新可提现余额
      refetchStakedAmount(); // 刷新质押余额
      
      // 如果是Withdraw交易成功，清空Withdraw金额输入
      if (isWithdrawTxSuccess) {
        setWithdrawAmount('');
      }
      
      // 如果是Unstake交易成功，清空Unstake金额输入
      if (isUnstakeTxSuccess) {
        setUnstakeAmount('');
      }
    }
  }, [isAnyTxSuccess, isWithdrawTxSuccess, isUnstakeTxSuccess, refetchWithdrawAmount, refetchStakedAmount]);
  
  // 监听可提现金额变化，设置最大可提现金额
  React.useEffect(() => {
    if (withdrawAmountData && withdrawAmountData[0] > BigInt(0)) {
      setMaxWithdrawAmount(formatEther(withdrawAmountData[0]));
    } else {
      setMaxWithdrawAmount('0');
    }
  }, [withdrawAmountData]);
  
  /**
   * 处理提现操作
   */
  const handleWithdraw = () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }
    
    if (ethPoolId === undefined || ethPoolId === null) {
      toast.error('无法获取矿池信息');
      return;
    }
    
    if (!withdrawAmountData || !withdrawAmountData[0] || withdrawAmountData[0] <= BigInt(0)) {
      toast.error('没有可提现的金额');
      return;
    }

    // 验证输入的提现金额
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('请输入有效的提现金额');
      return;
    }

    // 检查输入金额是否超过可提现余额
    const inputAmount = parseEther(withdrawAmount);
    if (inputAmount > withdrawAmountData[0]) {
      toast.error('输入金额超过可提现余额');
      return;
    }
    
    try {
      // 调用合约的withdraw方法
      // 注意：当前合约的withdraw函数只接受poolId参数，没有金额参数
      // 这意味着合约可能只支持全额提现，不支持部分提现
      // 如果需要部分提现功能，需要修改合约实现
      withdrawWriteContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: 'withdraw',
        args: [ethPoolId],
      });
      toast.info('提现请求已提交，等待确认...');
    } catch (error) {
      console.error('提现失败:', error);
      toast.error('提现失败，请重试');
    }
  };
  
  /**
   * 处理Unstake操作
   */
  const handleUnstake = () => {
    if (!isConnected || !address) {
      toast.error('请先连接钱包');
      return;
    }
    
    if (ethPoolId === undefined || ethPoolId === null) {
      toast.error('无法获取矿池信息');
      return;
    }
    
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error('请输入有效的Unstake金额');
      return;
    }
    
    try {
      // 调用合约的unstake方法
      unstakeWriteContract({
        address: process.env.NEXT_PUBLIC_STAKE_ADDRESS as `0x${string}`,
        abi: stakeAbi,
        functionName: 'unstake',
        args: [ethPoolId, parseEther(unstakeAmount)],
      });
      toast.info('Unstake请求已提交，等待确认...');
    } catch (error) {
      console.error('Unstake失败:', error);
      toast.error('Unstake失败，请重试');
    }
  };
  
  // 格式化金额
  const formattedStakedAmount = stakedAmount ? formatEther(stakedAmount) : '0';
  const formattedWithdrawableAmount = withdrawAmountData && withdrawAmountData[0] 
    ? formatEther(withdrawAmountData[0]) 
    : '0';
  const formattedPendingWithdrawAmount = withdrawAmountData && withdrawAmountData[1] 
    ? formatEther(withdrawAmountData[1]) 
    : '0';

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
          <h1 className="text-4xl font-bold text-white mb-2">Withdraw & Unstake</h1>
          <p className="text-violet-300">管理您的质押资金</p>
        </motion.div>
        
        {/* Unstake功能卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Unstake</h2>
          
          {isConnected ? (
            <div className="space-y-6">
              {/* Unstake金额输入 */}
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  placeholder="输入Unstake金额 (ETH)"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  disabled={isUnstakePending}
                  className="p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  step="0.000000000000000001"
                  min="0"
                />
                
                {/* 最大按钮 */}
                <button
                  onClick={() => setUnstakeAmount(formattedStakedAmount)}
                  disabled={isUnstakePending || !stakedAmount || stakedAmount <= BigInt(0)}
                  className="px-4 py-2 self-start bg-white/10 hover:bg-white/20 rounded-lg text-violet-200 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
              
              {/* Unstake按钮 */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUnstake}
                  disabled={isUnstakePending || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || !stakedAmount || stakedAmount <= BigInt(0)}
                  className={`px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
                    isUnstakePending
                      ? 'bg-blue-600/50 cursor-not-allowed text-gray-50'
                      : unstakeAmount && parseFloat(unstakeAmount) > 0 && stakedAmount && stakedAmount > BigInt(0)
                      ? 'bg-blue-500 hover:bg-blue-400 cursor-pointer text-white'
                      : 'bg-blue-600/50 cursor-not-allowed text-gray-50'
                  }`}
                >
                  {isUnstakePending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Pending...</span>
                    </div>
                  ) : (
                    'Unstake'
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-violet-300 text-lg">请先连接钱包进行Unstake操作</p>
            </div>
          )}
        </motion.div>
        
        {/* 资金信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-8 mb-8 border border-white/20"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">您的资金信息</h2>
          
          {isConnected ? (
            <div className="space-y-6">
              {/* 资金信息列表 - 单行卡片布局 */}
              <div className="flex flex-col sm:flex-row gap-4 overflow-x-auto">
                {/* Staked Amount */}
                <div className="flex-1 min-w-[250px] p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <p className="text-violet-300 text-sm mb-1">Staked Amount</p>
                  <p className="text-2xl font-bold text-white break-all">
                    {formattedStakedAmount} ETH
                  </p>
                </div>
                
                {/* Available to Withdraw */}
                <div className="flex-1 min-w-[250px] p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <p className="text-violet-300 text-sm mb-1">Available to Withdraw</p>
                  <p className="text-2xl font-bold text-white break-all">
                    {formattedWithdrawableAmount} ETH
                  </p>
                </div>
                
                {/* Pending Withdraw */}
                <div className="flex-1 min-w-[250px] p-4 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <p className="text-violet-300 text-sm mb-1">Pending Withdraw</p>
                  <p className="text-2xl font-bold text-white break-all">
                    {formattedPendingWithdrawAmount} ETH
                  </p>
                </div>
              </div>
              
              {/* Withdraw金额输入 */}
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  placeholder="输入提现金额 (ETH)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  disabled={isWithdrawPending}
                  className="p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  step="0.000000000000000001"
                  min="0"
                />
                
                {/* 最大按钮 */}
                <button
                  onClick={() => setWithdrawAmount(formattedWithdrawableAmount)}
                  disabled={isWithdrawPending || !withdrawAmountData || withdrawAmountData[0] <= BigInt(0)}
                  className="px-4 py-2 self-start bg-white/10 hover:bg-white/20 rounded-lg text-violet-200 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  MAX
                </button>
              </div>
              
              {/* Withdraw按钮 */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWithdraw}
                  disabled={isWithdrawPending || !withdrawAmountData || !withdrawAmountData[0] || withdrawAmountData[0] <= BigInt(0) || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  className={`px-10 py-4 rounded-full text-lg font-semibold transition-all duration-300 ${
                    isWithdrawPending
                      ? 'bg-violet-600/50 cursor-not-allowed text-gray-50'
                      : withdrawAmountData && withdrawAmountData[0] > BigInt(0) && withdrawAmount && parseFloat(withdrawAmount) > 0
                      ? 'bg-violet-500 hover:bg-violet-400 cursor-pointer text-white'
                      : 'bg-violet-600/50 cursor-not-allowed text-gray-50'
                  }`}
                >
                  {isWithdrawPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Pending...</span>
                    </div>
                  ) : (
                    'Withdraw'
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-violet-300 text-lg">请先连接钱包查看您的资金信息</p>
            </div>
          )}
        </motion.div>
        
        {/* 操作说明 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4">操作说明</h3>
          <ul className="space-y-2 text-violet-200">
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong>Unstake</strong>：发起质押资金的解锁请求，解锁后将变为可提现资金</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong>Withdraw</strong>：提取您已解锁的可提现资金</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>Unstake可能需要一定的锁定期，具体取决于矿池设置</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span>每次操作都会产生区块链交易费用，请确保您的钱包中有足够的Gas费用</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Withdraw;
