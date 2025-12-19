import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateStream } from './components/CreateStream';
import { WithdrawStream } from './components/WithdrawStream';
import { StreamList } from './components/StreamList';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-cyan-600/30 via-blue-600/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <header className="relative border-b border-white/10 backdrop-blur-xl bg-black/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 group">
                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/50 transition-all duration-300 group-hover:shadow-violet-500/80 group-hover:scale-110 animate-gradient relative">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
                  <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">SolStream</h1>
                  <p className="text-sm text-violet-300 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Token Vesting on Solana
                  </p>
                </div>
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-violet-600 !to-fuchsia-600 hover:!from-violet-700 hover:!to-fuchsia-700 !transition-all !duration-300 !shadow-xl !shadow-violet-500/50 hover:!shadow-violet-500/80 hover:!scale-105 !font-semibold !rounded-xl" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="transform transition-all duration-500 hover:scale-[1.02]">
              <CreateStream />
            </div>
            <div className="transform transition-all duration-500 hover:scale-[1.02]">
              <WithdrawStream />
            </div>
          </div>
          <div className="transform transition-all duration-500">
            <StreamList />
          </div>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-white/10 backdrop-blur-xl bg-black/30 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-slate-200 text-sm font-medium">
                  Powered by <span className="text-violet-400 font-bold">Solana</span> • Built with <span className="text-cyan-400 font-bold">Anchor</span>
                </p>
              </div>
              <div className="flex gap-4 text-xs text-slate-400 font-medium">
                <span className="px-3 py-1 bg-white/5 rounded-full">v1.0.0</span>
                <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Devnet
                </span>
                <span className="px-3 py-1 bg-white/5 rounded-full">MIT License</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
