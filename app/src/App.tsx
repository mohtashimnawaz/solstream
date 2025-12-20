import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateStream } from './components/CreateStream';
import { WithdrawStream } from './components/WithdrawStream';
import { StreamList } from './components/StreamList';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'withdraw'>('create');

  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-[#09090b] text-white">
        {/* Subtle Background */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-[#09090b] to-[#09090b]"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-zinc-900/20 via-transparent to-transparent"></div>

        {/* Header */}
        <header className="relative border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-white to-zinc-200 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white tracking-tight">SolStream</h1>
                  <p className="text-xs text-zinc-500">Token Vesting Protocol</p>
                </div>
              </div>

              <nav className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">Docs</a>
                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors font-medium">GitHub</a>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-xs text-emerald-400 font-semibold">Devnet</span>
                </div>
              </nav>

              <WalletMultiButton className="!bg-white !text-zinc-900 hover:!bg-zinc-100 !transition-all !text-sm !font-semibold !rounded-lg !h-9 !px-4 !shadow-sm hover:!shadow" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative">
          {/* Hero Section */}
          <section className="border-b border-zinc-800/50">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-full mb-6">
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-zinc-400 font-medium">Built on Solana</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-[1.1] tracking-tight">
                  Token Vesting,
                  <br />
                  <span className="text-zinc-600">Made Simple.</span>
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed max-w-xl mb-8">
                  Create and manage token vesting schedules with linear release, cliff periods, and secure withdrawals. Built with Anchor Framework for maximum security.
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-2xl font-bold text-white">0%</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Platform Fee</p>
                  </div>
                  <div className="w-px h-10 bg-zinc-800"></div>
                  <div>
                    <p className="text-2xl font-bold text-white">100%</p>
                    <p className="text-xs text-zinc-500 mt-0.5">On-Chain</p>
                  </div>
                  <div className="w-px h-10 bg-zinc-800"></div>
                  <div>
                    <p className="text-2xl font-bold text-white">Linear</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Vesting Model</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Actions Section */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-6">
              {/* Tab Navigation */}
              <div className="flex gap-1 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl w-fit mb-10">
                <button
                  onClick={() => setActiveTab('create')}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'create'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  Create Stream
                </button>
                <button
                  onClick={() => setActiveTab('withdraw')}
                  className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                    activeTab === 'withdraw'
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  Withdraw
                </button>
              </div>

              {/* Tab Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  {activeTab === 'create' ? <CreateStream /> : <WithdrawStream />}
                </div>
                <div className="lg:col-span-1">
                  <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 sticky top-24 shadow-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-white">How it works</h3>
                    </div>
                    <div className="space-y-4">
                      {activeTab === 'create' ? (
                        <>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">1</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Set beneficiary</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">Enter the wallet address of the token recipient</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">2</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Configure schedule</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">Set vesting period, cliff duration, and total amount</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">3</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Create stream</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">Sign the transaction to deploy your vesting contract</p>
                            </div>
                          </div>
                          <div className="mt-6 pt-6 border-t border-zinc-800">
                            <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                              <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs text-amber-400/90 leading-relaxed">Ensure you have sufficient tokens and SOL for transaction fees</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">1</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Find your stream</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">Enter the sender's wallet address and token mint</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">2</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Check vested amount</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">View how many tokens are available to claim</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold text-white">3</span>
                            </div>
                            <div>
                              <p className="text-sm text-white font-medium mb-1">Withdraw tokens</p>
                              <p className="text-xs text-zinc-500 leading-relaxed">Claim your vested tokens to your wallet</p>
                            </div>
                          </div>
                          <div className="mt-6 pt-6 border-t border-zinc-800">
                            <div className="flex items-start gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                              <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs text-blue-400/90 leading-relaxed">You can only withdraw tokens that have already vested</p>
                            </div>
                          </div>
                        </>
                      )}  
                    </div>

                    <div className="hidden mt-6 pt-5 border-t border-zinc-800">
                      <div className="flex items-start gap-2.5">
                        <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                          Running on Devnet. Ensure you have devnet SOL and tokens.
                        </p>
                      </div>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Streams Section */}
          <section className="py-16 border-t border-zinc-800/50">
            <div className="max-w-6xl mx-auto px-6">
              <StreamList />
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-zinc-800/50 bg-[#09090b] mt-20">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-white to-zinc-200 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white">SolStream</h3>
                </div>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mb-4">
                  A secure, decentralized token vesting protocol built on Solana. Create custom vesting schedules with linear release and cliff periods.
                </p>
                <div className="flex items-center gap-3">
                  <a href="#" className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all group">
                    <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all group">
                    <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center hover:border-zinc-700 hover:bg-zinc-800 transition-all group">
                    <svg className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Roadmap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Guides</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-zinc-800 pt-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-zinc-500">
                  © 2025 SolStream. Built with <span className="text-white font-medium">Anchor</span> on <span className="text-white font-medium">Solana</span>
                </p>
                <div className="flex items-center gap-6">
                  <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Privacy</a>
                  <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">Terms</a>
                  <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">License</a>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Signature Watermark */}
        <a
          href="https://portfolio-main-sooty-mu.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="tubelight-signature"
        >
          by nwz
        </a>
      </div>
    </WalletContextProvider>
  );
}

export default App;
