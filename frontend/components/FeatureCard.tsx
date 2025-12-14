'use client';

import { ReactNode, useState } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  expandedDescription?: string;
}

export function FeatureCard({ icon, title, description, expandedDescription }: FeatureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="group relative bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-gray-200 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:border-violet-500/50 dark:hover:border-violet-500/30 transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Neon glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/10 group-hover:to-purple-500/10 transition-all duration-300 -z-10" />
      
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 border border-violet-300 dark:border-violet-500/30">
          <div className="group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {title}
        </h3>
        
        <p className={`text-gray-700 dark:text-gray-400 leading-relaxed transition-all duration-300 text-base ${
          isExpanded && expandedDescription ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}>
          {description}
        </p>
        
        {expandedDescription && (
          <p className={`text-gray-600 dark:text-gray-300 leading-relaxed transition-all duration-300 text-base ${
            isExpanded ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            {expandedDescription}
          </p>
        )}
      </div>
    </div>
  );
}
