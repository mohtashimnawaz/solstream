import { WalletContextProvider } from './contexts/WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { CreateStream } from './components/CreateStream';
import { WithdrawStream } from './components/WithdrawStream';
import { StreamList } from './components/StreamList';

function App() {
  return (
    <WalletContextProvider>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SolStream</h1>
                  <p className="text-sm text-purple-200">Token Vesting Platform</p>
                </div>
              </div>
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <CreateStream />
            <WithdrawStream />
          </div>
          <StreamList />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 backdrop-blur-sm bg-black/20 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-purple-200 text-sm">
              Built on Solana with Anchor Framework
            </p>
          </div>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;
