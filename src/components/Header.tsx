"use client"

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`relative text-black dark:text-white hover:text-violet-400 dark:hover:text-violet-400 transition-all duration-300 font-medium px-3 py-2 rounded-lg group`}
    >
      <span className="relative z-10">{children}</span>
      {/* 渐变文字效果 */}
      <span
        className={`absolute inset-0 flex items-center justify-center bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''}`}
      >
        {children}
      </span>
      {/* 下划线动画效果 */}
      <span
        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-violet-400 to-fuchsia-400 transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}
      ></span>
    </Link>
  );
}

/**
 * 应用程序头部导航组件
 * 显示品牌信息、导航链接和钱包连接按钮
 */
export default function Header() {
  return (
    <header className="w-full py-4 px-6 backdrop-blur-md bg-white/5 border-b border-white/10 shadow-lg shadow-violet-500/5">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            MetaNode Stake
          </span>
        </div>
        <div className="flex gap-6">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/stake">Stake</NavLink>
          <NavLink href="/withdraw">Withdraw</NavLink>
          <NavLink href="/claim">Claim</NavLink>
        </div>
        {/* RainbowKit 连接按钮 */}
        <ConnectButton />
      </div>
    </header>
  );
}
