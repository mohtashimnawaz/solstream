import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useProgram } from '../hooks/useProgram';

interface VestingStream {
  address: string;
  sender: string;
  beneficiary: string;
  mint: string;
  totalAmount: number;
  amountWithdrawn: number;
  startTime: Date;
  endTime: Date;
  cliffDuration: number;
}

export const StreamList = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { program } = useProgram();
  const [streams, setStreams] = useState<VestingStream[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && program) {
      loadStreams();
    }
  }, [publicKey, program]);

  const loadStreams = async () => {
    if (!program || !publicKey) return;

    setLoading(true);
    try {
      const accounts = await program.account.vestingAccount.all([
        {
          memcmp: {
            offset: 8 + 32, // After discriminator and sender
            bytes: publicKey.toBase58(),
          },
        },
      ]);

      const streamData: VestingStream[] = accounts.map((account: any) => ({
        address: account.publicKey.toBase58(),
        sender: account.account.sender.toBase58(),
        beneficiary: account.account.beneficiary.toBase58(),
        mint: account.account.mint.toBase58(),
        totalAmount: account.account.totalAmount.toNumber() / 1_000_000,
        amountWithdrawn: account.account.amountWithdrawn.toNumber() / 1_000_000,
        startTime: new Date(account.account.startTime.toNumber() * 1000),
        endTime: new Date(account.account.endTime.toNumber() * 1000),
        cliffDuration: account.account.cliffDuration.toNumber(),
      }));

      setStreams(streamData);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateVested = (stream: VestingStream): number => {
    const now = Date.now();
    const start = stream.startTime.getTime();
    const end = stream.endTime.getTime();
    const cliff = start + stream.cliffDuration * 1000;

    if (now < cliff) return 0;
    if (now >= end) return stream.totalAmount;

    const elapsed = now - start;
    const duration = end - start;
    const vested = (stream.totalAmount * elapsed) / duration;

    return Math.max(0, vested);
  };

  if (!publicKey) {
    return null;
  }

  return (
    <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg animate-gradient">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Your Vesting Streams</h2>
            <p className="text-sm text-purple-300">{streams.length} active stream{streams.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={loadStreams}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-purple-500/50 hover:scale-105 font-semibold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              🔄 Refresh
            </span>
          )}
        </button>
      </div>

      {streams.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-purple-200 text-lg font-medium">No vesting streams found</p>
          <p className="text-purple-300/70 text-sm mt-2">Create your first stream to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {streams.map((stream, index) => {
            const vested = calculateVested(stream);
            const claimable = vested - stream.amountWithdrawn;
            const percentVested = (vested / stream.totalAmount) * 100;

            return (
              <div
                key={stream.address}
                className="glass-dark rounded-2xl p-6 hover:bg-black/50 transition-all duration-300 border border-white/10 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-purple-300 font-medium">Sender</p>
                        <p className="text-white font-mono text-sm">{stream.sender.slice(0, 6)}...{stream.sender.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-purple-300 font-medium">Beneficiary</p>
                        <p className="text-white font-mono text-sm">{stream.beneficiary.slice(0, 6)}...{stream.beneficiary.slice(-6)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-purple-300 font-medium mb-1">Total Amount</p>
                      <p className="text-white font-bold text-lg">{stream.totalAmount.toLocaleString()} 🪙</p>
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-purple-300 font-medium mb-1">Withdrawn</p>
                      <p className="text-white font-bold text-lg">{stream.amountWithdrawn.toLocaleString()} 🪙</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-purple-300 text-xs">Start Time</p>
                        <p className="text-white font-medium">{stream.startTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-purple-300 text-xs">End Time</p>
                        <p className="text-white font-medium">{stream.endTime.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-purple-200">Vesting Progress</span>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        percentVested >= 100 ? 'bg-green-500/20 text-green-300' : 
                        percentVested >= 50 ? 'bg-yellow-500/20 text-yellow-300' : 
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {percentVested.toFixed(1)}%
                      </div>
                    </div>
                    <span className="text-white font-bold text-lg">{percentVested.toFixed(2)}%</span>
                  </div>
                  <div className="relative w-full h-4 bg-black/50 rounded-full overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-1000 ease-out animate-gradient relative"
                      style={{ width: `${Math.min(percentVested, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between p-4 glass-dark rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-purple-200">Claimable Now:</span>
                    </div>
                    <span className="text-green-400 font-bold text-xl">{claimable.toFixed(6)} tokens</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
