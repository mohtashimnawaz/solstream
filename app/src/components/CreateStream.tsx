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
    } catch (error: any) {
      console.error('Error creating stream:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Create Vesting Stream</h2>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-200 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please connect your wallet to create a vesting stream
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-gradient">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Create Vesting Stream</h2>
      </div>
      <form onSubmit={handleCreateStream} className="space-y-5">\n        <div className="group">
          <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
            Beneficiary Address
          </label>
          <input
            type="text"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
            placeholder="Enter beneficiary public key"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
            Token Mint Address
          </label>
          <input
            type="text"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
            placeholder="Enter token mint address"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
            Total Amount (tokens)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
              placeholder="1000"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-400 font-semibold text-xl">
              💰
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
              required
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-violet-200 mb-2 transition-colors group-focus-within:text-violet-300">
            Cliff Duration (minutes)
          </label>
          <input
            type="number"
            value={cliffMinutes}
            onChange={(e) => setCliffMinutes(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200 hover:border-white/20"
            placeholder="10"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-700 hover:via-fuchsia-700 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-violet-500/50 hover:shadow-violet-500/80 hover:scale-[1.02] shine overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Stream...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Create Vesting Stream
            </span>
          )}
        </button>
      </form>
    </div>
  );
};
