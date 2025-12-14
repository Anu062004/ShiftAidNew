'use client';

import { useState, useEffect } from 'react';
import { Heart, ArrowRight, TrendingUp } from 'lucide-react';

interface DonationEvent {
  id: string;
  donor: string;
  amount: string;
  coin: string;
  ngo: string;
  usdc: string;
  time: string;
}

// Demo donation events
const DEMO_EVENTS: DonationEvent[] = [
  { id: '1', donor: '0x7a3f...', amount: '0.5', coin: 'ETH', ngo: 'Save the Children', usdc: '1,513', time: '2 min ago' },
  { id: '2', donor: '0x9b2c...', amount: '2.0', coin: 'BTC', ngo: 'UNICEF', usdc: '85,200', time: '5 min ago' },
  { id: '3', donor: '0x4d8e...', amount: '100', coin: 'USDC', ngo: 'Red Cross', usdc: '100', time: '8 min ago' },
  { id: '4', donor: '0x6f1a...', amount: '1.2', coin: 'ETH', ngo: 'World Food Programme', usdc: '3,632', time: '12 min ago' },
  { id: '5', donor: '0x3c9b...', amount: '50', coin: 'MATIC', ngo: 'Doctors Without Borders', usdc: '45', time: '15 min ago' },
  { id: '6', donor: '0x8a4d...', amount: '0.8', coin: 'ETH', ngo: 'Oxfam', usdc: '2,421', time: '18 min ago' },
];

export function LiveImpactStrip() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % DEMO_EVENTS.length);
        setIsVisible(true);
      }, 300);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const event = DEMO_EVENTS[currentIndex];

  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-white/5 backdrop-blur-sm border-y border-gray-200 dark:border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Label */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Live Impact</span>
            <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-white/5 px-2 py-0.5 rounded-full border border-gray-300 dark:border-white/10">Demo</span>
          </div>

          {/* Animated Event */}
          <div className="flex-1 flex items-center gap-4 overflow-hidden">
            <div
              key={event.id}
              className={`flex items-center gap-4 min-w-full transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
              }`}
            >
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                <span className="font-mono text-gray-700 dark:text-gray-300">{event.donor}</span>
                <span className="text-gray-600 dark:text-gray-500">donated</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{event.amount} {event.coin}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-500">→</span>
                <span className="font-bold text-green-600 dark:text-green-400">{event.usdc} USDC</span>
                <span className="text-gray-600 dark:text-gray-500">to</span>
                <span className="font-semibold text-violet-600 dark:text-violet-400">{event.ngo}</span>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-500 ml-auto">{event.time}</span>
            </div>
          </div>

          {/* View More */}
          <div className="flex-shrink-0">
            <a
              href="/dashboard"
              className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
            >
              View all →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
