import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { useProgram } from '../hooks/useProgram';

export const CreateStream = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program } = useProgram();

  const [beneficiary, setBeneficiary] = useState('');
  const [mint, setMint] = useState('');
  const [amount, setAmount] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [cliffMinutes, setCliffMinutes] = useState('10');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !program) return;

    setLoading(true);
    try {
      const beneficiaryPubkey = new PublicKey(beneficiary);
      const mintPubkey = new PublicKey(mint);
      const totalAmount = new BN(parseFloat(amount) * 1_000_000); // Assuming 6 decimals

      const startTimeUnix = new BN(Math.floor(new Date(startTime).getTime() / 1000));
      const endTimeUnix = new BN(Math.floor(new Date(endTime).getTime() / 1000));
      const cliffDuration = new BN(parseInt(cliffMinutes) * 60);

      // Derive PDA
      const [vestingAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting'),
          publicKey.toBuffer(),
          beneficiaryPubkey.toBuffer(),
          mintPubkey.toBuffer(),
        ],
        program.programId
      );

      // Get vault ATA
      const vault = await getAssociatedTokenAddress(
        mintPubkey,
        vestingAccount,
        true
      );

      // Get sender token account
      const senderTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        publicKey
      );

      const tx = await program.methods
        .initializeStream(totalAmount, startTimeUnix, endTimeUnix, cliffDuration)
        .accounts({
          vestingAccount,
          vault,
          sender: publicKey,
          beneficiary: beneficiaryPubkey,
          mint: mintPubkey,
          senderTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      alert(`Stream created! Transaction: ${tx}`);
      
      // Reset form
      setBeneficiary('');
      setMint('');
      setAmount('');
      setStartTime('');
      setEndTime('');
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error creating stream:', error);
      setError(error.message || 'Failed to create stream');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 sm:p-8">
        <div className="text-center py-6 sm:py-8">
          <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">Connect your wallet to create a vesting stream</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/5 p-4 sm:p-6">
      <div className="p-4 sm:p-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Create Vesting Stream</h2>
        <p className="text-sm text-zinc-500 mt-1">Set up a new token vesting schedule</p>
      </div>
      
      <form onSubmit={handleCreateStream} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {success && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-emerald-400">Stream created successfully!</h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">Your vesting stream has been created on-chain.</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-400">Error creating stream</h4>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Beneficiary Address
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm font-mono"
            placeholder="Enter wallet address"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Token Mint Address
          </label>
          <input
            type="text"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm font-mono"
            placeholder="Enter token mint"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Total Amount
          </label>
          <input
            type="number"
            step="0.000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm"
            placeholder="1000"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Cliff Duration (minutes)
          </label>
          <input
            type="number"
            value={cliffMinutes}
            onChange={(e) => setCliffMinutes(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm"
            placeholder="10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-white text-zinc-900 rounded-lg font-semibold hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm active:bg-zinc-200 active:scale-[0.99] shadow-sm hover:shadow-lg hover:shadow-white/10 relative overflow-hidden group btn-tap"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          ) : (
            <>
              <span className="relative z-10">Create Stream</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
