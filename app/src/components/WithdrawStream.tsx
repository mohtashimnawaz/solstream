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
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      
      // Reset form
      setSender('');
      setMint('');
      setSuccess(true);
      setError('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error withdrawing:', error);
      setError(error.message || 'Failed to withdraw tokens');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-zinc-400 text-sm">Connect your wallet to withdraw tokens</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:shadow-white/5">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">Withdraw Tokens</h2>
        <p className="text-sm text-zinc-500 mt-1">Claim your vested tokens</p>
      </div>
      
      <form onSubmit={handleWithdraw} className="p-6 space-y-5">
        {success && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-emerald-400">Withdrawal successful!</h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">Your vested tokens have been claimed.</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-400">Error withdrawing tokens</h4>
              <p className="text-xs text-red-400/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Sender Address
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-700 hover:border-zinc-700 transition-all text-sm font-mono"
            placeholder="Enter sender wallet address"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white hover:bg-zinc-100 active:bg-zinc-200 active:scale-[0.99] text-zinc-900 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-sm hover:shadow-lg hover:shadow-white/10 relative overflow-hidden group"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Withdrawing...
            </span>
          ) : (
            <>
              <span className="relative z-10">Withdraw Tokens</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
