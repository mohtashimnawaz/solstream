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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-white">Your Vesting Streams</h2>
          <p className="text-sm text-zinc-500 mt-0.5">{streams.length} active stream{streams.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={loadStreams}
          disabled={loading}
          className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
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

      {streams.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-zinc-300 font-medium">No vesting streams</p>
            <p className="text-zinc-500 text-sm mt-1">Create your first stream to get started</p>
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
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">From</span>
                        <code className="text-sm text-zinc-300 font-mono">{stream.sender.slice(0, 4)}...{stream.sender.slice(-4)}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">To</span>
                        <code className="text-sm text-white font-mono">{stream.beneficiary.slice(0, 4)}...{stream.beneficiary.slice(-4)}</code>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Total Amount</p>
                      <p className="text-sm font-medium text-white">{stream.totalAmount.toLocaleString()} tokens</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Withdrawn</p>
                      <p className="text-sm font-medium text-zinc-400">{stream.amountWithdrawn.toLocaleString()} tokens</p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-zinc-500">Vesting Progress</span>
                    <span className="text-xs font-medium text-white">{percentVested.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(percentVested, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>Start: {stream.startTime.toLocaleDateString()}</span>
                    <span>End: {stream.endTime.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Claimable:</span>
                    <span className="text-sm font-medium text-emerald-400">{claimable.toFixed(2)} tokens</span>
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
