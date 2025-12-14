import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { FeatureCard } from '@/components/FeatureCard';
import { HowItWorks } from '@/components/HowItWorks';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { LiveImpactStrip } from '@/components/LiveImpactStrip';
import { Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0E14] relative overflow-hidden transition-colors duration-300">
      {/* Slow-moving gradient blobs */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-40 right-20 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-[400px] h-[400px] bg-cyan-500/8 dark:bg-cyan-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

      <Navbar />
      
      <main>
        <Hero />
        
        {/* Live Impact Strip */}
        <LiveImpactStrip />

        {/* Features - Asymmetric Layout */}
        <section className="py-16 relative">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto md:translate-x-4">
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-violet-400" strokeWidth={1.5} />}
                title="Instant Conversion"
                description="Donate in any cryptocurrency. SideShift automatically converts it to the NGO's preferred stablecoin."
                expandedDescription="SideShift handles the conversion instantly. You send BTC, ETH, or any supported crypto, and the NGO receives USDC, USDT, or DAI on their preferred network - all in one transaction!"
              />
              <FeatureCard
                icon={<Shield className="h-10 w-10 text-cyan-400" strokeWidth={1.5} />}
                title="On-Chain Transparency"
                description="All donations are recorded on-chain. Every transaction is verifiable and auditable."
                expandedDescription="Every donation is permanently recorded on the blockchain. You can verify transactions using blockchain explorers. NGOs can see all donations in real-time, ensuring complete transparency and trust."
              />
              <FeatureCard
                icon={<Globe className="h-10 w-10 text-blue-400" strokeWidth={1.5} />}
                title="Borderless Donations"
                description="Support NGOs worldwide without intermediaries. Direct wallet-to-wallet donations."
                expandedDescription="No borders, no banks, no delays. Your donation goes directly from your wallet to the NGO's wallet. Support causes anywhere in the world, 24/7, with instant settlement on the blockchain."
              />
            </div>
          </div>
        </section>

        <HowItWorks />
      </main>

      <Footer />
      <Chatbot />
    </div>
  );
}

