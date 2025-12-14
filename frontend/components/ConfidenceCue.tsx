'use client';

import { useState, useEffect } from 'react';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ConfidenceCueProps {
  message: string;
  icon?: 'shield' | 'arrow' | 'check';
  show?: boolean;
  duration?: number;
}

export function ConfidenceCue({ 
  message, 
  icon = 'shield', 
  show = true,
  duration = 4000 
}: ConfidenceCueProps) {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const iconMap = {
    shield: <Shield className="h-4 w-4" />,
    arrow: <ArrowRight className="h-4 w-4" />,
    check: <CheckCircle2 className="h-4 w-4" />,
  };

  return (
    <div
      className={`flex items-center gap-2 px-5 py-3 bg-cyan-50 dark:bg-white/5 backdrop-blur-sm border border-cyan-500/50 dark:border-cyan-500/30 rounded-full shadow-lg shadow-cyan-500/20 text-sm text-gray-800 dark:text-gray-200 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div className="text-cyan-600 dark:text-cyan-400">{iconMap[icon]}</div>
      <span className="font-medium">{message}</span>
    </div>
  );
}
