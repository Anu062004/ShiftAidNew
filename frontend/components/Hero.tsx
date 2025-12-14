'use client';

import Link from 'next/link';
import { ArrowRight, Wallet, Heart, Building2, Coins, ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount } from 'wagmi';
import { useState, useEffect } from 'react';
import { ConfidenceCue } from '@/components/ConfidenceCue';

export function Hero() {
  const { isConnected } = useAccount();
  const [demoAmount, setDemoAmount] = useState(1);
  const [showPulse, setShowPulse] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const estimatedUSDC = (demoAmount * 3027).toFixed(2);

  // Pulse animation when slider changes
  useEffect(() => {
    setShowPulse(true);
    const timer = setTimeout(() => setShowPulse(false), 600);
    return () => clearTimeout(timer);
  }, [demoAmount]);

  // Show confidence cue when wallet connects
  useEffect(() => {
    if (isConnected) {
      setShowConfidence(true);
      const timer = setTimeout(() => setShowConfidence(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Slow-moving gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-violet-500/15 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 right-1/4 w-[800px] h-[800px] bg-blue-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-6 text-center">
        {/* Confidence Cue */}
        {showConfidence && (
          <div className="mb-6 flex justify-center">
            <ConfidenceCue 
              message="Non-custodial — you stay in control • Funds go directly to NGO wallet"
              icon="shield"
              show={showConfidence}
            />
          </div>
        )}

        {/* Massive Headline */}
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-gray-900 dark:text-gray-50 mb-6 leading-[1.1] tracking-tight">
          <span className="inline-block animate-fade-in">Donate Any Crypto.</span>
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-violet-600 dark:from-violet-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
            NGOs Get Stablecoins.
          </span>
        </h1>
        
        <p className="text-xl sm:text-2xl text-gray-700 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
          Trustless, instant crypto donations powered by SideShift.
        </p>

        {/* Visual Flow Hint */}
        <div className="flex items-center justify-center gap-4 mb-10 opacity-80">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-violet-500/30 dark:border-violet-500/20">
            <Coins className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Your Crypto</span>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-violet-500/30 dark:border-violet-500/20">
            <Heart className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">SideShift</span>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-xl border border-violet-500/30 dark:border-violet-500/20">
            <Building2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-300">NGO</span>
          </div>
        </div>

        {/* BIG Demo Donation Preview - Center Focused */}
        <div className={`max-w-2xl mx-auto mb-10 bg-gray-50 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-gray-200 dark:border-white/10 transition-all duration-300 ${
          showPulse ? 'border-violet-500/50 dark:border-violet-500/50 shadow-[0_0_40px_rgba(139,92,246,0.3)]' : ''
        }`}>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-6 uppercase tracking-wider">Try it out (Demo)</p>
          <div className="space-y-6">
            <div>
              <label className="block text-base font-semibold text-gray-800 dark:text-gray-300 mb-3">Amount: {demoAmount} ETH</label>
              <div className="relative">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={demoAmount}
                  onChange={(e) => setDemoAmount(parseFloat(e.target.value))}
                  className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-violet-600 dark:accent-violet-500"
                />
                {showPulse && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-violet-400/30 rounded-full animate-ping" />
                )}
              </div>
            </div>
            <div className={`relative flex items-center justify-between p-6 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-500/10 dark:to-purple-500/10 rounded-2xl border border-violet-300 dark:border-violet-500/20 transition-all duration-300 ${
              showPulse ? 'scale-105 shadow-[0_0_30px_rgba(139,92,246,0.4)]' : ''
            }`}>
              <div className="text-left">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">You send</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{demoAmount} ETH</p>
              </div>
              <div className="relative">
                <Heart className="h-6 w-6 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                {showPulse && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-full animate-ping" />
                  </div>
                )}
              </div>
              <ArrowRight className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">NGO receives</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">~{estimatedUSDC} USDC</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-500 justify-center">
              <span>Polygon Network</span>
              <span>•</span>
              <span className="text-green-600 dark:text-green-400 font-medium">Low fees</span>
            </div>
          </div>
        </div>

        {/* BIG CTA Buttons - 56-64px height */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          {!isConnected ? (
            <>
              <Link href="/donate" className="relative">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-10 py-7 text-lg font-bold rounded-full shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-200 h-16 min-w-[280px]"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;`;
                    button.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                  }}
                >
                  <Wallet className="mr-3 h-6 w-6" />
                  Connect Wallet & Start Donating
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/ngos">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-10 py-7 text-lg font-semibold rounded-full border-2 border-gray-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all duration-200 h-16"
                >
                  View NGOs
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/donate" className="relative">
                <Button 
                  size="lg" 
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-10 py-7 text-lg font-bold rounded-full shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-200 h-16 min-w-[280px]"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const ripple = document.createElement('span');
                    const rect = button.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;left:${x}px;top:${y}px;background:rgba(255,255,255,0.3);border-radius:50%;transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;`;
                    button.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                  }}
                >
                  Choose NGO & Donate
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="px-10 py-7 text-lg font-semibold rounded-full border-2 border-gray-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all duration-200 h-16"
                >
                  View Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-400">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-full border border-violet-500/30 dark:border-violet-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 animate-pulse" />
            <span className="font-medium">On-chain</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-full border border-violet-500/30 dark:border-violet-500/20">
            <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
            <span className="font-medium">Non-custodial</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-full border border-violet-500/30 dark:border-violet-500/20">
            <div className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 animate-pulse" />
            <span className="font-medium">Polygon</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 backdrop-blur-sm rounded-full border border-violet-500/30 dark:border-violet-500/20">
            <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
            <span className="font-medium">Powered by SideShift</span>
          </div>
        </div>
      </div>
    </section>
  );
}
