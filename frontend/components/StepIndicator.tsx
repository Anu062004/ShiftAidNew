'use client';

import { useAccount } from 'wagmi';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
  key: string;
}

const steps: Step[] = [
  { id: 1, label: 'Connect Wallet', key: 'wallet' },
  { id: 2, label: 'Choose NGO', key: 'ngo' },
  { id: 3, label: 'Donate', key: 'donate' },
  { id: 4, label: 'Impact', key: 'impact' },
];

interface StepIndicatorProps {
  currentStep?: string;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { isConnected } = useAccount();
  
  // Determine current step based on wallet connection and currentStep prop
  let activeStep = 1;
  if (isConnected) {
    activeStep = currentStep === 'donate' ? 3 : currentStep === 'ngo' ? 2 : 2;
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-800">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500 ease-out shadow-lg shadow-violet-500/50"
            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isActive = step.id <= activeStep;
          const isCurrent = step.id === activeStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center flex-1">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/50 border-2 border-violet-400/50'
                    : 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                } ${isCurrent ? 'scale-110 ring-4 ring-violet-500/30' : ''}`}
              >
                {isActive && step.id < activeStep ? (
                  <Check className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-black">{step.id}</span>
                )}
              </div>
              
              {/* Step Label */}
              <span
                className={`mt-3 text-xs font-bold transition-colors ${
                  isActive ? 'text-gray-100' : 'text-gray-500'
                } ${isCurrent ? 'text-violet-400' : ''}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
