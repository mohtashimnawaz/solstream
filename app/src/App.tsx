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
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-5">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="text-sm font-semibold text-white">How it works</h3>
                    </div>
                    <div className="space-y-5">
                      {activeTab === 'create' ? (
                        <>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">1</div>
                            <div>
                              <p className="text-sm text-zinc-300">Enter beneficiary</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Wallet that receives tokens</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">2</div>
                            <div>
                              <p className="text-sm text-zinc-300">Set schedule</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Start, end, and cliff period</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">3</div>
                            <div>
                              <p className="text-sm text-zinc-300">Deposit tokens</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Locked in secure vault</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">1</div>
                            <div>
                              <p className="text-sm text-zinc-300">Enter details</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Sender and token mint</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">2</div>
                            <div>
                              <p className="text-sm text-zinc-300">Check vested</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Available tokens calculated</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 flex-shrink-0 font-medium">3</div>
                            <div>
                              <p className="text-sm text-zinc-300">Claim tokens</p>
                              <p className="text-xs text-zinc-500 mt-0.5">Withdraw to wallet</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 pt-5 border-t border-zinc-800">
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
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gradient-to-br from-white to-zinc-200 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-4 h-4 text-zinc-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-zinc-400">SolStream</p>
                  <p className="text-xs text-zinc-600">Secure token vesting on Solana</p>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">Documentation</a>
                <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">GitHub</a>
                <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a>
                <span className="text-zinc-700">v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
