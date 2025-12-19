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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Vesting Streams</h2>
        <button
          onClick={loadStreams}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {streams.length === 0 ? (
        <p className="text-purple-200 text-center py-8">No vesting streams found for your wallet.</p>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => {
            const vested = calculateVested(stream);
            const claimable = vested - stream.amountWithdrawn;
            const percentVested = (vested / stream.totalAmount) * 100;

            return (
              <div
                key={stream.address}
                className="bg-black/30 border border-white/20 rounded-xl p-6 hover:bg-black/40 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Sender</p>
                    <p className="text-white font-mono text-xs">{stream.sender.slice(0, 8)}...{stream.sender.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Beneficiary</p>
                    <p className="text-white font-mono text-xs">{stream.beneficiary.slice(0, 8)}...{stream.beneficiary.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Total Amount</p>
                    <p className="text-white font-semibold">{stream.totalAmount.toLocaleString()} tokens</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Withdrawn</p>
                    <p className="text-white font-semibold">{stream.amountWithdrawn.toLocaleString()} tokens</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">Start Time</p>
                    <p className="text-white text-sm">{stream.startTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-purple-300 mb-1">End Time</p>
                    <p className="text-white text-sm">{stream.endTime.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-300">Vesting Progress</span>
                    <span className="text-white font-semibold">{percentVested.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500"
                      style={{ width: `${Math.min(percentVested, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-purple-200 mt-2">
                    Claimable: <span className="text-green-400 font-semibold">{claimable.toFixed(6)} tokens</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
