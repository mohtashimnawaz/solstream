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
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
        <h2 className="text-2xl font-bold text-white mb-4">Withdraw Vested Tokens</h2>
        <p className="text-purple-200">Please connect your wallet to withdraw tokens.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
      <h2 className="text-2xl font-bold text-white mb-6">Withdraw Vested Tokens</h2>
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Sender Address
          </label>
          <input
            type="text"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter sender public key"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">
            Token Mint Address
          </label>
          <input
            type="text"
            value={mint}
            onChange={(e) => setMint(e.target.value)}
            className="w-full px-4 py-3 bg-black/30 border border-white/20 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter token mint address"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Withdrawing...' : 'Withdraw Vested Tokens'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
        <p className="text-sm text-blue-200">
          💡 <strong>Tip:</strong> You can only withdraw tokens that have vested according to the linear schedule and after the cliff period has passed.
        </p>
      </div>
    </div>
  );
};
