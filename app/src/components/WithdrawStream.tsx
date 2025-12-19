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
      <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">Withdraw Vested Tokens</h2>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <p className="text-yellow-200 text-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Please connect your wallet to withdraw tokens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl hover:shadow-green-500/20 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 via-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-gradient">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Withdraw Vested Tokens</h2>
      </div>
      <form onSubmit={handleWithdraw} className="space-y-5">
        <div className="group">
          <label className="block text-sm font-semibold text-purple-200 mb-2 transition-colors group-focus-within:text-purple-300">
            Sender Address
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter sender public key"
            required
          />
        </div>

        <div className="group">
          <label className="block text-sm font-semibold text-purple-200 mb-2 transition-colors group-focus-within:text-purple-300">
            Token Mint Address
          </label>
          <input
            type="text"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            placeholder="Enter token mint address"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full bg-gradient-to-r from-green-600 via-teal-600 to-emerald-600 hover:from-green-700 hover:via-teal-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/50 hover:shadow-green-500/80 hover:scale-[1.02] shine overflow-hidden"
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
            '💰 Withdraw Vested Tokens'
          )}
        </button>
      </form>

      <div className="mt-6 p-5 glass-dark rounded-2xl border border-blue-400/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-200 mb-1">💡 Pro Tip</p>
            <p className="text-sm text-blue-300/80">
              You can only withdraw tokens that have vested according to the linear schedule and after the cliff period has passed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
