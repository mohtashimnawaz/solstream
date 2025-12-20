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

const StreamList = () => {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { program } = useProgram();
  const [streams, setStreams] = useState<VestingStream[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey && program) {
      loadStreams();
    }
  }, [publicKey, program]);

  const loadStreams = async (retryCount = 0, delayMs = 4000) => {
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
    } catch (error: any) {
      // Check for 429 error (rate limit)
      const is429 = error?.message?.includes('429') || error?.toString().includes('429');
      if (is429 && retryCount < 5) {
        console.warn(`429 received, retrying after ${delayMs}ms (attempt ${retryCount + 1})`);
        setTimeout(() => loadStreams(retryCount + 1, delayMs * 2), delayMs);
      } else {
        console.error('Error loading streams:', error);
        if (is429) {
          alert('Too many requests to Solana RPC. Please try again later or switch to a different endpoint.');
        }
      }
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
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Active Vesting Streams</h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            {streams.length > 0 ? (
              <>
                <span className="text-white font-medium">{streams.length}</span> {streams.length === 1 ? 'stream' : 'streams'} found
              </>
            ) : (
              'No streams yet'
            )}
          </p>
        </div>
        <button
          onClick={loadStreams}
          disabled={loading}
          className="px-4 py-2 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-lg transition-all disabled:opacity-50 text-sm font-medium flex items-center gap-2 shadow-sm w-full sm:w-auto btn-tap"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {loading && streams.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-6 animate-pulse">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-5">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-2">
                    <div className="h-5 w-48 bg-zinc-800 rounded"></div>
                    <div className="h-5 w-48 bg-zinc-800 rounded"></div>
                  </div>
                </div>
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 xs:gap-8">
                  <div className="h-12 w-24 bg-zinc-800 rounded"></div>
                  <div className="w-px h-10 bg-zinc-800"></div>
                  <div className="h-12 w-24 bg-zinc-800 rounded"></div>
                </div>
              </div>
              <div className="mb-5">
                <div className="h-2 w-full bg-zinc-800 rounded-full"></div>
              </div>
              <div className="flex justify-between items-center pt-5 border-t border-zinc-800">
                <div className="h-4 w-48 bg-zinc-800 rounded"></div>
                <div className="h-8 w-32 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 sm:p-16">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-zinc-800/60 to-zinc-900/80 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 0V4m0 16v-4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No vesting streams found</h3>
            <p className="text-sm text-zinc-500 leading-relaxed mb-6">
              {!connected
                ? "Connect your wallet to view your vesting streams."
                : "You haven't created or received any vesting streams yet. Create a new stream to get started."}
            </p>
            {connected && (
              <button className="text-sm text-zinc-400 hover:text-white transition-colors font-medium flex items-center gap-2 mx-auto mt-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create your first stream
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => {
            const vested = calculateVested(stream);
            const claimable = vested - stream.amountWithdrawn;
            const percentVested = (vested / stream.totalAmount) * 100;

            return (
              <div
                key={stream.address}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-300 group hover:shadow-xl hover:shadow-white/5 hover:scale-[1.01]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 mb-5">
                  <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 xs:gap-6">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 group/address">
                        <span className="text-xs text-zinc-500 font-medium">From</span>
                        <code className="text-sm text-zinc-400 font-mono bg-zinc-800 px-2 py-0.5 rounded">
                          {stream.sender.slice(0, 4)}...{stream.sender.slice(-4)}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(stream.sender)}
                          className="opacity-0 group-hover/address:opacity-100 transition-opacity text-zinc-500 hover:text-white"
                          title="Copy address"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 group/address">
                        <span className="text-xs text-zinc-500 font-medium">To</span>
                        <code className="text-sm text-white font-mono bg-zinc-800 px-2 py-0.5 rounded">
                          {stream.beneficiary.slice(0, 4)}...{stream.beneficiary.slice(-4)}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(stream.beneficiary)}
                          className="opacity-0 group-hover/address:opacity-100 transition-opacity text-zinc-500 hover:text-white"
                          title="Copy address"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 font-medium mb-1">Total Amount</p>
                      <p className="text-base font-semibold text-white">{stream.totalAmount.toLocaleString()}</p>
                    </div>
                    <div className="w-px h-10 bg-zinc-800"></div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 font-medium mb-1">Withdrawn</p>
                      <p className="text-base font-semibold text-zinc-400">{stream.amountWithdrawn.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2.5 gap-2 sm:gap-0">
                    <span className="text-xs text-zinc-500 font-medium">Vesting Progress</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        percentVested >= 100 ? 'bg-emerald-500/10 text-emerald-400' :
                        percentVested >= 50 ? 'bg-amber-500/10 text-amber-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {percentVested >= 100 ? 'Completed' : 'Active'}
                      </span>
                      <span className="text-sm font-semibold text-white">{percentVested.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-inner ${
                        percentVested >= 100 ? 'bg-emerald-500' :
                        percentVested >= 50 ? 'bg-amber-500' :
                        'bg-white'
                      } animate-pulse`}
                      style={{ width: `${Math.min(percentVested, 100)}%` }}
                    >
                      <div className="absolute inset-0 animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-zinc-800 text-xs sm:text-xs md:text-sm">
                  <div className="flex items-center gap-6 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{stream.startTime.toLocaleDateString()}</span>
                    </div>
                    <span className="text-zinc-700">→</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span>{stream.endTime.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-zinc-500 font-medium">Claimable:</span>
                    <span className="text-sm font-semibold text-emerald-400">{claimable.toFixed(2)}</span>
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

export default StreamList;
