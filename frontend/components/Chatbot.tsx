'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'what is shiftaid': 'ShiftAid is a decentralized donation platform that lets you donate in any cryptocurrency. Your donation is automatically converted to stablecoins (like USDC) and sent directly to the NGO\'s wallet. It\'s trustless, transparent, and borderless!',
  'is this safe': 'Yes! ShiftAid is completely safe. Your funds are never held by us - they go directly from your wallet to the NGO via SideShift. All transactions are recorded on-chain, so you can verify everything. It\'s non-custodial, meaning we never control your funds.',
  'where does my money go': 'Your donation goes directly to the NGO\'s wallet address. We use SideShift to convert your crypto to stablecoins instantly, and the NGO receives the funds on their preferred network (usually Polygon). You can see the transaction on the blockchain!',
  'what is sideshift': 'SideShift is a cross-chain swap service that powers ShiftAid. It automatically converts any cryptocurrency you donate into the stablecoin the NGO prefers. Think of it as an instant currency converter for crypto!',
  'are donations on-chain': 'Yes! Every donation is recorded on the blockchain. You can verify all transactions using blockchain explorers. This ensures complete transparency and trust.',
  'which networks are supported': 'ShiftAid supports multiple networks through SideShift. You can donate from Bitcoin, Ethereum, Polygon, Arbitrum, and many others. NGOs typically receive funds on Polygon for low fees.',
  'how does it work': '1. Connect your crypto wallet\n2. Choose an NGO to support\n3. Select the crypto you want to donate\n4. Get a real-time quote\n5. Send your crypto - SideShift converts it to stablecoins\n6. The NGO receives funds instantly!',
  'what fees': 'SideShift charges a small fee for the conversion, which is shown in your quote before you donate. There are also network fees (gas) for blockchain transactions. Polygon has very low fees!',
  'can i donate any crypto': 'Yes! As long as SideShift supports the cryptocurrency, you can donate it. Popular options include BTC, ETH, MATIC, USDC, and many more.',
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasAutoInitiated, setHasAutoInitiated] = useState(false);
  const [hasPulsed, setHasPulsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isConnected } = useAccount();

  // Auto-initiate chatbot after 3 seconds - slide in and pulse
  useEffect(() => {
    if (!hasAutoInitiated) {
      const timer = setTimeout(() => {
        setIsExpanded(true);
        setIsOpen(true);
        setHasAutoInitiated(true);
        const initialMessage: Message = {
          id: '1',
          role: 'assistant',
          content: "Want to see how your crypto reaches an NGO in seconds?",
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
        
        // Pulse once after 500ms
        setTimeout(() => {
          setHasPulsed(true);
          setTimeout(() => setHasPulsed(false), 1000);
        }, 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [hasAutoInitiated]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  function getContextualMessage(): string | null {
    if (!isConnected) {
      return "💡 Tip: Start by connecting your wallet using the button in the top right!";
    }
    return "✅ Great! Your wallet is connected. Ready to make a donation?";
  }

  function findResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase().trim();

    // Check for greetings
    if (lowerMessage.match(/^(hi|hello|hey|greetings)/)) {
      return "Hello! I'm your donation guide. Let's get you started!";
    }

    // Check for step guidance
    if (lowerMessage.match(/(what.*next|what.*do|how.*start|guide|help.*donate)/)) {
      if (!isConnected) {
        return "Here's your next step:\n\n1️⃣ Connect your wallet using the button in the top right corner\n2. Once connected, click 'Donate' in the navigation\n3. Choose an NGO and cryptocurrency\n4. Complete your donation!\n\nNeed help with any step?";
      }
      return "Great! You're ready to donate:\n\n1. Go to the 'Donate' page\n2. Select an NGO from the list\n3. Choose your cryptocurrency and amount\n4. Review the quote and confirm\n\nYour donation will be converted to stablecoins automatically!";
    }

    // Check for safety/trust questions
    if (lowerMessage.match(/(safe|secure|trust|scam|legit)/)) {
      return "ShiftAid is completely safe! 🔒\n\n✅ Non-custodial: We never hold your funds\n✅ On-chain: All transactions are verifiable\n✅ Direct: Funds go straight to NGOs\n✅ Transparent: Every donation is recorded\n\nYour crypto goes directly from your wallet to the NGO via SideShift. We're just the platform that makes it easy!";
    }

    // Check FAQ
    for (const [key, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }

    // Default responses
    if (lowerMessage.match(/(thank|thanks|ty)/)) {
      return "You're welcome! Happy to help. Feel free to ask if you have more questions! 😊";
    }

    if (lowerMessage.match(/(bye|goodbye|see you)/)) {
      return "Goodbye! Feel free to come back anytime if you need help. Happy donating! 💙";
    }

    // Generic helpful response
    return "I can help you with:\n\n• Understanding how ShiftAid works\n• Explaining the donation process\n• Answering safety questions\n• Guiding you step-by-step\n\nTry asking: 'What is ShiftAid?', 'Is this safe?', or 'How do I donate?'";
  }

  function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = findResponse(userMessage.content);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800);
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      {/* Partially Expanded Pill (Default State) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsExpanded(true);
          }}
          className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/50 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 ${
            hasPulsed ? 'animate-pulse-glow' : ''
          }`}
          aria-label="Open donation guide"
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-semibold text-sm">Donation Guide</span>
        </button>
      )}

      {/* Chat Panel - Slide in from right */}
      {isOpen && (
        <div className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white dark:bg-[#0F172A]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 dark:border-violet-500/20 flex flex-col animate-slide-in-right ${
          isExpanded ? '' : 'hidden'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-light)' }}>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center border"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-accent), var(--brand-secondary))',
                  borderColor: 'var(--brand-primary)',
                }}
              >
                <Bot className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>Donation Guide</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Here to help</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsExpanded(false);
              }}
              className="w-8 h-8 rounded-full hover:opacity-80 flex items-center justify-center transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary)' }}
            >
              <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-accent), var(--brand-secondary))',
                      borderColor: 'var(--brand-primary)',
                    }}
                  >
                    <Bot className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-base font-medium ${
                    message.role === 'user' ? '' : 'border'
                  }`}
                  style={{
                    backgroundColor: message.role === 'user' 
                      ? 'var(--brand-primary)' 
                      : 'var(--bg-secondary)',
                    color: message.role === 'user' 
                      ? '#ffffff' 
                      : 'var(--text-primary)',
                    borderColor: message.role === 'assistant' ? 'var(--border-light)' : 'transparent',
                  }}
                >
                  <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                </div>
                {message.role === 'user' && (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border"
                    style={{
                      backgroundColor: 'var(--text-secondary)',
                      borderColor: 'var(--border-medium)',
                    }}
                  >
                    <User className="h-5 w-5" style={{ color: '#ffffff' }} />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center border"
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-accent), var(--brand-secondary))',
                    borderColor: 'var(--brand-primary)',
                  }}
                >
                  <Bot className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
                </div>
                <div 
                  className="rounded-2xl px-5 py-3 border"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    borderColor: 'var(--border-light)',
                  }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--brand-primary)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Reply Buttons */}
            {messages.length === 1 && messages[0].content.includes('Want to see') && (
              <div className="space-y-2 mt-4">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      const response = "Great! Here's how it works:\n\n1️⃣ You choose an NGO and crypto amount\n2️⃣ SideShift converts it to stablecoins instantly\n3️⃣ Funds go directly to the NGO's wallet\n4️⃣ You can verify everything on-chain!\n\nReady to try it? Click 'Donate' in the menu!";
                      const assistantMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: response,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, assistantMessage]);
                    }}
                    className="w-full text-left text-sm px-5 py-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl transition-all duration-200 hover:scale-[1.02] font-semibold shadow-lg shadow-violet-500/30"
                  >
                    ✨ Show me
                  </button>
                  <button
                    onClick={() => {
                      const response = "Absolutely safe! 🔒\n\n✅ Non-custodial: We never hold your funds\n✅ Direct: Crypto goes straight to NGO wallet\n✅ On-chain: Every transaction is verifiable\n✅ Transparent: You can see everything\n\nYour funds are always in your control until they reach the NGO!";
                      const assistantMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: response,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, assistantMessage]);
                    }}
                    className="w-full text-left text-sm px-5 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] font-medium border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    🔒 Is this safe?
                  </button>
                  <button
                    onClick={() => {
                      const response = "Here's the simple flow:\n\n1. Connect your crypto wallet\n2. Choose an NGO to support\n3. Select crypto and amount\n4. Get instant quote (e.g., 1 ETH = 3,027 USDC)\n5. Send crypto → SideShift converts it\n6. NGO receives stablecoins instantly!\n\nWant me to guide you step-by-step?";
                      const assistantMessage: Message = {
                        id: Date.now().toString(),
                        role: 'assistant',
                        content: response,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, assistantMessage]);
                    }}
                    className="w-full text-left text-sm px-5 py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] font-medium border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      borderColor: 'var(--border-light)',
                    }}
                  >
                    ❓ How does this work?
                  </button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-4 h-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
