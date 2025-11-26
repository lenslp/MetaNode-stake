import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// 导入常用的区块链网络
import { sepolia, mainnet, polygon, optimism } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'MetaNode Stake',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || '', 
  chains: [mainnet, sepolia, polygon, optimism], // 引入常用链，可添加更多链
});