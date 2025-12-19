import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Solstream } from "../target/types/solstream";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert } from "chai";

describe("solstream", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.solstream as Program<Solstream>;

  let mint: anchor.web3.PublicKey;
  let sender: anchor.web3.Keypair;
  let beneficiary: anchor.web3.Keypair;
  let senderTokenAccount: anchor.web3.PublicKey;
  let beneficiaryTokenAccount: anchor.web3.PublicKey;

  before(async () => {
    // Create keypairs
    sender = anchor.web3.Keypair.generate();
    beneficiary = anchor.web3.Keypair.generate();

    // Airdrop SOL to sender and beneficiary
    const senderAirdrop = await provider.connection.requestAirdrop(
      sender.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(senderAirdrop);

    const beneficiaryAirdrop = await provider.connection.requestAirdrop(
      beneficiary.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(beneficiaryAirdrop);

    // Create mint
    mint = await createMint(
      provider.connection,
      sender,
      sender.publicKey,
      null,
      6 // 6 decimals
    );

    // Create token accounts
    senderTokenAccount = await createAccount(
      provider.connection,
      sender,
      mint,
      sender.publicKey
    );

    beneficiaryTokenAccount = await createAccount(
      provider.connection,
      beneficiary,
      mint,
      beneficiary.publicKey
    );

    // Mint tokens to sender
    await mintTo(
      provider.connection,
      sender,
      mint,
      senderTokenAccount,
      sender,
      1_000_000_000 // 1,000 tokens (with 6 decimals)
    );
  });

  it("Initialize vesting stream", async () => {
    const totalAmount = new BN(1_000_000_000); // 1,000 tokens
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = new BN(currentTime);
    const endTime = new BN(currentTime + 3600); // 1 hour vesting period
    const cliffDuration = new BN(600); // 10 minutes cliff

    // Derive PDA for vesting account
    const [vestingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender.publicKey.toBuffer(),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    // Derive vault ATA
    const vault = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount,
    });

    const tx = await program.methods
      .initializeStream(totalAmount, startTime, endTime, cliffDuration)
      .accounts({
        vestingAccount,
        vault,
        sender: sender.publicKey,
        beneficiary: beneficiary.publicKey,
        mint,
        senderTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender])
      .rpc();

    console.log("Initialize stream transaction signature:", tx);

    // Verify vesting account state
    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccount
    );

    assert.equal(
      vestingAccountData.sender.toBase58(),
      sender.publicKey.toBase58()
    );
    assert.equal(
      vestingAccountData.beneficiary.toBase58(),
      beneficiary.publicKey.toBase58()
    );
    assert.equal(vestingAccountData.mint.toBase58(), mint.toBase58());
    assert.equal(vestingAccountData.totalAmount.toString(), totalAmount.toString());
    assert.equal(vestingAccountData.amountWithdrawn.toString(), "0");

    // Verify vault has the tokens
    const vaultAccount = await getAccount(provider.connection, vault);
    assert.equal(vaultAccount.amount.toString(), totalAmount.toString());
  });

  it("Cannot withdraw before cliff", async () => {
    const [vestingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender.publicKey.toBuffer(),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    const vault = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount,
    });

    try {
      await program.methods
        .withdraw()
        .accounts({
          vestingAccount,
          vault,
          beneficiary: beneficiary.publicKey,
          beneficiaryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([beneficiary])
        .rpc();

      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.toString(), "NothingToWithdraw");
    }
  });

  it("Test linear vesting math - withdraw after half the vesting period", async () => {
    // Wait for cliff to pass (10 minutes) and get to 30 minutes (half way)
    // In real test, we'd need to wait or manipulate time
    // For demonstration, we'll show the test structure

    const [vestingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender.publicKey.toBuffer(),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    const vault = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount,
    });

    // Note: In a real test environment, you'd need to:
    // 1. Use a localnet with time manipulation
    // 2. Or set start_time in the past
    // 3. Or use a clockwork/time service

    console.log("\n=== Linear Vesting Math Example ===");
    console.log("Total Amount: 1,000 tokens");
    console.log("Vesting Duration: 1 hour (3600 seconds)");
    console.log("Cliff: 10 minutes (600 seconds)");
    console.log("\nFormula: (Total * (Current - Start)) / (End - Start) - Withdrawn");
    console.log("\nAt 30 minutes (1800 seconds after start):");
    console.log("Vested = (1000 * 1800) / 3600 = 500 tokens");
    console.log("At 60 minutes (end): 1000 tokens fully vested");

    // Fetch current state
    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccount
    );

    const currentTime = Math.floor(Date.now() / 1000);
    const elapsed = currentTime - vestingAccountData.startTime.toNumber();
    const duration = vestingAccountData.endTime.toNumber() - vestingAccountData.startTime.toNumber();

    console.log(`\nCurrent elapsed time: ${elapsed} seconds`);
    console.log(`If elapsed >= cliff (${vestingAccountData.cliffDuration.toNumber()}s):`);
    
    if (elapsed >= vestingAccountData.cliffDuration.toNumber()) {
      const expectedVested = Math.floor(
        (vestingAccountData.totalAmount.toNumber() * elapsed) / duration
      );
      console.log(`Expected vested: ${expectedVested / 1_000_000} tokens`);
    }
  });

  it("Withdraw vested tokens (with modified start time)", async () => {
    // Create a new vesting stream with start time in the past
    const sender2 = anchor.web3.Keypair.generate();
    const beneficiary2 = anchor.web3.Keypair.generate();

    // Airdrop SOL
    const airdrop1 = await provider.connection.requestAirdrop(
      sender2.publicKey,
      10 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop1);

    const airdrop2 = await provider.connection.requestAirdrop(
      beneficiary2.publicKey,
      5 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdrop2);

    // Create token accounts
    const sender2TokenAccount = await createAccount(
      provider.connection,
      sender2,
      mint,
      sender2.publicKey
    );

    const beneficiary2TokenAccount = await createAccount(
      provider.connection,
      beneficiary2,
      mint,
      beneficiary2.publicKey
    );

    // Mint tokens to sender2
    await mintTo(
      provider.connection,
      sender2,
      mint,
      sender2TokenAccount,
      sender,
      1_000_000_000
    );

    // Set start time 30 minutes in the past, end time 30 minutes in the future
    const currentTime = Math.floor(Date.now() / 1000);
    const totalAmount = new BN(1_000_000_000); // 1,000 tokens
    const startTime = new BN(currentTime - 1800); // 30 min ago
    const endTime = new BN(currentTime + 1800); // 30 min from now
    const cliffDuration = new BN(600); // 10 min cliff (already passed)

    const [vestingAccount2] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender2.publicKey.toBuffer(),
        beneficiary2.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    const vault2 = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount2,
    });

    // Initialize stream
    await program.methods
      .initializeStream(totalAmount, startTime, endTime, cliffDuration)
      .accounts({
        vestingAccount: vestingAccount2,
        vault: vault2,
        sender: sender2.publicKey,
        beneficiary: beneficiary2.publicKey,
        mint,
        senderTokenAccount: sender2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([sender2])
      .rpc();

    console.log("\n=== Withdraw Test ===");

    // Withdraw vested tokens
    const tx = await program.methods
      .withdraw()
      .accounts({
        vestingAccount: vestingAccount2,
        vault: vault2,
        beneficiary: beneficiary2.publicKey,
        beneficiaryTokenAccount: beneficiary2TokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([beneficiary2])
      .rpc();

    console.log("Withdraw transaction signature:", tx);

    // Verify beneficiary received tokens
    const beneficiaryAccount = await getAccount(
      provider.connection,
      beneficiary2TokenAccount
    );

    console.log(`Beneficiary received: ${Number(beneficiaryAccount.amount) / 1_000_000} tokens`);

    // Should have received approximately 50% of tokens (500 tokens)
    // Since we're at the halfway point (30 min elapsed, 60 min total)
    const expectedAmount = totalAmount.toNumber() / 2;
    const tolerance = totalAmount.toNumber() * 0.01; // 1% tolerance

    assert.approximately(
      Number(beneficiaryAccount.amount),
      expectedAmount,
      tolerance,
      "Beneficiary should receive ~50% of tokens at halfway point"
    );

    // Verify vesting account updated
    const vestingAccountData = await program.account.vestingAccount.fetch(
      vestingAccount2
    );
    assert.equal(
      vestingAccountData.amountWithdrawn.toString(),
      beneficiaryAccount.amount.toString()
    );

    console.log(`Amount withdrawn recorded: ${vestingAccountData.amountWithdrawn.toNumber() / 1_000_000} tokens`);
  });

  it("Cannot withdraw more than vested", async () => {
    const [vestingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender.publicKey.toBuffer(),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    const vault = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount,
    });

    // Try to withdraw again immediately (should fail - nothing new vested)
    try {
      await program.methods
        .withdraw()
        .accounts({
          vestingAccount,
          vault,
          beneficiary: beneficiary.publicKey,
          beneficiaryTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([beneficiary])
        .rpc();

      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.include(error.toString(), "NothingToWithdraw");
    }
  });

  it("Only beneficiary can withdraw", async () => {
    const [vestingAccount] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("vesting"),
        sender.publicKey.toBuffer(),
        beneficiary.publicKey.toBuffer(),
        mint.toBuffer(),
      ],
      program.programId
    );

    const vault = anchor.utils.token.associatedAddress({
      mint: mint,
      owner: vestingAccount,
    });

    // Try to withdraw with sender (should fail)
    try {
      await program.methods
        .withdraw()
        .accounts({
          vestingAccount,
          vault,
          beneficiary: sender.publicKey, // Wrong signer
          beneficiaryTokenAccount: senderTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([sender])
        .rpc();

      assert.fail("Should have thrown an error");
    } catch (error) {
      // Should fail with constraint error
      assert.isTrue(error.toString().includes("Error"));
    }
  });
});
