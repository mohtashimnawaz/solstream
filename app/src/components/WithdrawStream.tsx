import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from '../hooks/useProgram';

export const WithdrawStream = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { program } = useProgram();

  const [sender, setSender] = useState('');
  const [mint, setMint] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey || !program) return;

    setLoading(true);
    try {
      const senderPubkey = new PublicKey(sender);
      const mintPubkey = new PublicKey(mint);

      // Derive PDA
      const [vestingAccount] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('vesting'),
          senderPubkey.toBuffer(),
          publicKey.toBuffer(),
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

      // Get beneficiary token account
      const beneficiaryTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        publicKey
      );

      const tx = await program.methods
        .withdraw()
        .accounts({
          vestingAccount,
          vault,
          beneficiary: publicKey,
          beneficiaryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      alert(`Withdrawal successful! Transaction: ${tx}`);
      
      // Reset form
      setSender('');
      setMint('');
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-gradient">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">Withdraw Tokens</h2>
            <p className="text-sm text-slate-400">Claim your vested tokens</p>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
            <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-cyan-300 font-medium text-lg mb-2">Wallet Not Connected</p>
          <p className="text-slate-400 text-sm">Connect your wallet to withdraw tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-2xl hover:border-cyan-500/30 transition-all duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-gradient">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-200 to-emerald-200 bg-clip-text text-transparent">Withdraw Tokens</h2>
          <p className="text-sm text-slate-400">Claim your vested tokens</p>
        </div>
      </div>
      <form onSubmit={handleWithdraw} className="space-y-6">
        <div className="group">
          <label className="block text-sm font-semibold text-cyan-200 mb-2 transition-colors group-focus-within:text-cyan-300">
            Sender Address
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 hover:border-white/20"
            placeholder="Enter sender public key"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-cyan-200 mb-2 transition-colors group-focus-within:text-cyan-300">
            Token Mint Address
          </label>
          <input
            type="text"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200 hover:border-white/20"
            placeholder="Enter token mint address"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full bg-gradient-to-r from-cyan-600 via-emerald-600 to-teal-600 hover:from-cyan-700 hover:via-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-cyan-500/50 hover:shadow-cyan-500/80 hover:scale-[1.02] shine overflow-hidden"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Withdrawing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Withdraw Tokens
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 p-5 glass-dark rounded-2xl border border-cyan-400/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-200 mb-1">💡 Pro Tip</p>
            <p className="text-sm text-slate-300">
              You can only withdraw tokens that have vested according to the linear schedule and after the cliff period has passed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
