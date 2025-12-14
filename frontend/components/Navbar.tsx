'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart } from 'lucide-react';
import { DarkModeToggle } from './DarkModeToggle';

const WalletConnectButton = dynamic(() => import('@/components/WalletConnectButton').then(mod => ({ default: mod.WalletConnectButton })), {
  ssr: false,
  loading: () => <div className="w-32 h-10" />,
});

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 dark:border-white/5 border-gray-200 dark:bg-[#0F172A]/80 bg-white/80 backdrop-blur-xl transition-colors duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Heart className="h-5 w-5 text-violet-500 dark:text-violet-500 group-hover:text-violet-400 transition-colors" />
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors">ShiftAid</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              href="/donate" 
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Donate
            </Link>
            <Link 
              href="/ngos" 
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              NGOs
            </Link>
            <Link 
              href="/dashboard" 
              className="text-base font-semibold text-gray-700 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
            >
              Dashboard
            </Link>
          </nav>

          {/* Right Side - Dark Mode Toggle + Wallet */}
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}


