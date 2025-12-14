'use client';

interface Step {
  number: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Connect Wallet',
    description: 'Connect your crypto wallet',
  },
  {
    number: 2,
    title: 'Choose NGO',
    description: 'Select a verified NGO',
  },
  {
    number: 3,
    title: 'Get Quote',
    description: 'See real-time rates',
  },
  {
    number: 4,
    title: 'Donate',
    description: 'Send crypto instantly',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl sm:text-5xl font-black text-center text-gray-900 dark:text-gray-100 mb-12">
          How It Works
        </h2>

        {/* Desktop: Horizontal Stepper */}
        <div className="hidden md:block relative">
          {/* Connecting Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500/50 via-purple-500/50 to-violet-500/50 dark:from-violet-500/30 dark:via-purple-500/30 dark:to-violet-500/30" />
          
          <div className="relative grid grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                {/* Step Circle */}
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border-2 border-violet-400/50">
                  <span className="text-2xl font-black text-white">{step.number}</span>
                </div>
                
                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Vertical Stack */}
        <div className="md:hidden space-y-8">
          {steps.map((step) => (
            <div key={step.number} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border-2 border-violet-400/50">
                <span className="text-lg font-black text-white">{step.number}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
