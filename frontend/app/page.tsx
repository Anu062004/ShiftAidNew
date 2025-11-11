import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, Shield, Zap, Globe } from 'lucide-react';

// Dynamically import WalletConnect to avoid SSR hydration issues
const WalletConnect = dynamic(() => import('@/components/WalletConnect').then(mod => ({ default: mod.WalletConnect })), {
  ssr: false,
  loading: () => <div className="w-32 h-10" />, // Placeholder to prevent layout shift
});

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold text-gray-900">ShiftAid</span>
          </div>
          <nav className="flex gap-4 items-center">
            <Link href="/donate" className="text-gray-700 hover:text-gray-900">
              Donate
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/ngos" className="text-gray-700 hover:text-gray-900">
              NGOs
            </Link>
            <WalletConnect />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Donate Any Crypto, NGOs Get Stablecoins{' '}
            <span className="text-blue-600">Instantly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A trustless, transparent, and borderless donation protocol powered by SideShift API.
            Remove the complexity of crypto donations while ensuring transparency and speed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/donate">
              <Button size="lg" className="text-lg px-8">
                Start Donating <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Zap className="h-10 w-10 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Instant Conversion</h3>
            <p className="text-gray-600">
              Donate in any cryptocurrency. SideShift automatically converts it to the NGO's preferred stablecoin.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="h-10 w-10 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Fully Transparent</h3>
            <p className="text-gray-600">
              All donations are recorded on-chain. Every transaction is verifiable and auditable.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Globe className="h-10 w-10 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Borderless</h3>
            <p className="text-gray-600">
              Support NGOs worldwide without intermediaries. Direct wallet-to-wallet donations.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">Connect Wallet</h4>
              <p className="text-sm text-gray-600">Connect your crypto wallet</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">Choose NGO</h4>
              <p className="text-sm text-gray-600">Select a verified NGO to support</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">Get Quote</h4>
              <p className="text-sm text-gray-600">See real-time conversion rates</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">4</span>
              </div>
              <h4 className="font-semibold mb-2">Donate</h4>
              <p className="text-sm text-gray-600">Send crypto, NGO gets stablecoins</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Powered by SideShift API • Built for the SideShift Buildathon</p>
        </div>
      </footer>
    </div>
  );
}

