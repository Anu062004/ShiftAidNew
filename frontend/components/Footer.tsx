import { Github, Twitter, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0F172A]/50 backdrop-blur-sm py-8 mt-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-700 dark:text-gray-400">
            ShiftAid — Decentralized Crypto Donations
          </p>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <Github className="h-5 w-5" />
            </a>
            <a 
              href="https://docs.sideshift.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <BookOpen className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com/sideshift_ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-700 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-gray-600 dark:text-gray-500">
          Powered by SideShift API • Built for the SideShift Buildathon
        </p>
      </div>
    </footer>
  );
}
