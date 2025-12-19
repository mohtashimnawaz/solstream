import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateStream } from './components/CreateStream';
import { WithdrawStream } from './components/WithdrawStream';
import { StreamList } from './components/StreamList';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-500/20 to-transparent rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        {/* Header */}
        <header className="relative border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50 transition-all duration-300 group-hover:shadow-purple-500/80 group-hover:scale-110 animate-gradient">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white bg-gradient-to-r from-white via-purple-100 to-blue-100 bg-clip-text text-transparent">SolStream</h1>
                  <p className="text-sm text-purple-300 font-medium">⚡ Token Vesting Platform</p>
                </div>
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !via-pink-600 !to-blue-600 hover:!from-purple-700 hover:!via-pink-700 hover:!to-blue-700 !transition-all !duration-300 !shadow-lg !shadow-purple-500/50 hover:!shadow-purple-500/80 hover:!scale-105" />
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
        <footer className="relative border-t border-white/10 backdrop-blur-xl bg-black/20 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0L9.798 8.906 1 9.798 7.634 16.068 5.797 24 12 19.403 18.203 24 16.366 16.068 23 9.798 14.202 8.906z"/>
                  </svg>
                </div>
                <p className="text-purple-200 text-sm font-medium">
                  Built on <span className="text-purple-400 font-bold">Solana</span> with <span className="text-blue-400 font-bold">Anchor Framework</span>
                </p>
              </div>
              <div className="flex gap-4 text-xs text-purple-300">
                <span>v1.0.0</span>
                <span>•</span>
                <span>Devnet</span>
                <span>•</span>
                <span>Made with ❤️</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
