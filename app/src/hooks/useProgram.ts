import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { Solstream } from '../types/solstream';
import IDL from '../idl/solstream.json';

const PROGRAM_ID = new PublicKey('C44y98NwZv9wbCZXYfY114tbYCgyZB2L5mEZ98ySAKdx');

export const useProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const program = useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });

    return new Program(IDL as Solstream, provider);
  }, [connection, wallet]);

  return { program, programId: PROGRAM_ID };
};
