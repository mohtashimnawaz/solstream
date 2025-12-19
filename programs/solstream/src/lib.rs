use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("C44y98NwZv9wbCZXYfY114tbYCgyZB2L5mEZ98ySAKdx");

#[program]
pub mod solstream {
    use super::*;

    /// Initialize a new vesting stream
    pub fn initialize_stream(
        ctx: Context<InitializeStream>,
        total_amount: u64,
        start_time: i64,
        end_time: i64,
        cliff_duration: i64,
    ) -> Result<()> {
        require!(total_amount > 0, ErrorCode::InvalidAmount);
        require!(end_time > start_time, ErrorCode::InvalidTimeRange);
        require!(cliff_duration >= 0, ErrorCode::InvalidCliffDuration);
        
        let vesting_account = &mut ctx.accounts.vesting_account;
        vesting_account.sender = ctx.accounts.sender.key();
        vesting_account.beneficiary = ctx.accounts.beneficiary.key();
        vesting_account.mint = ctx.accounts.mint.key();
        vesting_account.total_amount = total_amount;
        vesting_account.start_time = start_time;
        vesting_account.end_time = end_time;
        vesting_account.cliff_duration = cliff_duration;
        vesting_account.amount_withdrawn = 0;
        vesting_account.vault = ctx.accounts.vault.key();
        vesting_account.bump = ctx.bumps.vesting_account;

        // Transfer tokens from sender to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.sender_token_account.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.sender.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, total_amount)?;

        msg!("Vesting stream initialized: {} tokens from {} to {}",
            total_amount,
            ctx.accounts.sender.key(),
            ctx.accounts.beneficiary.key()
        );

        Ok(())
    }

    /// Withdraw vested tokens
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let current_time = Clock::get()?.unix_timestamp;

        // Get values we need before mutable borrow
        let total_amount = ctx.accounts.vesting_account.total_amount;
        let start_time = ctx.accounts.vesting_account.start_time;
        let end_time = ctx.accounts.vesting_account.end_time;
        let cliff_duration = ctx.accounts.vesting_account.cliff_duration;
        let amount_withdrawn = ctx.accounts.vesting_account.amount_withdrawn;
        let sender = ctx.accounts.vesting_account.sender;
        let beneficiary = ctx.accounts.vesting_account.beneficiary;
        let mint = ctx.accounts.vesting_account.mint;
        let bump = ctx.accounts.vesting_account.bump;

        // Calculate claimable amount
        let claimable = calculate_claimable_amount(
            total_amount,
            start_time,
            end_time,
            cliff_duration,
            amount_withdrawn,
            current_time,
        )?;

        require!(claimable > 0, ErrorCode::NothingToWithdraw);

        // Verify vault has sufficient funds
        require!(
            ctx.accounts.vault.amount >= claimable,
            ErrorCode::InsufficientVaultFunds
        );

        // Transfer tokens from vault to beneficiary
        let seeds = &[
            b"vesting",
            sender.as_ref(),
            beneficiary.as_ref(),
            mint.as_ref(),
            &[bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.beneficiary_token_account.to_account_info(),
            authority: ctx.accounts.vesting_account.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, claimable)?;

        // Update withdrawn amount
        let vesting_account = &mut ctx.accounts.vesting_account;
        vesting_account.amount_withdrawn = vesting_account
            .amount_withdrawn
            .checked_add(claimable)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Withdrawn {} tokens to beneficiary", claimable);

        Ok(())
    }
}

/// Calculate the claimable amount based on linear vesting
fn calculate_claimable_amount(
    total_amount: u64,
    start_time: i64,
    end_time: i64,
    cliff_duration: i64,
    amount_withdrawn: u64,
    current_time: i64,
) -> Result<u64> {
    // Before cliff, nothing is claimable
    let cliff_end = start_time
        .checked_add(cliff_duration)
        .ok_or(ErrorCode::MathOverflow)?;
    
    if current_time < cliff_end {
        return Ok(0);
    }

    // Before start time, nothing is claimable
    if current_time < start_time {
        return Ok(0);
    }

    // After end time, everything is claimable
    if current_time >= end_time {
        return Ok(total_amount.saturating_sub(amount_withdrawn));
    }

    // Linear vesting calculation
    // vested = (total_amount * (current_time - start_time)) / (end_time - start_time)
    let elapsed_time = (current_time - start_time) as u64;
    let total_duration = (end_time - start_time) as u64;

    let vested_amount = (total_amount as u128)
        .checked_mul(elapsed_time as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(total_duration as u128)
        .ok_or(ErrorCode::MathOverflow)?
        as u64;

    // Claimable = vested - already withdrawn
    let claimable = vested_amount.saturating_sub(amount_withdrawn);

    Ok(claimable)
}

// ========================================
// Account Structures
// ========================================

#[derive(Accounts)]
pub struct InitializeStream<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + VestingAccount::INIT_SPACE,
        seeds = [b"vesting", sender.key().as_ref(), beneficiary.key().as_ref(), mint.key().as_ref()],
        bump
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(
        init,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = vesting_account,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: Beneficiary doesn't need to sign during initialization
    pub beneficiary: AccountInfo<'info>,

    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = sender_token_account.owner == sender.key(),
        constraint = sender_token_account.mint == mint.key()
    )]
    pub sender_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(
        mut,
        seeds = [b"vesting", vesting_account.sender.as_ref(), vesting_account.beneficiary.as_ref(), vesting_account.mint.as_ref()],
        bump = vesting_account.bump,
        has_one = vault,
        has_one = beneficiary,
    )]
    pub vesting_account: Account<'info, VestingAccount>,

    #[account(mut)]
    pub vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub beneficiary: Signer<'info>,

    #[account(
        mut,
        constraint = beneficiary_token_account.owner == beneficiary.key(),
        constraint = beneficiary_token_account.mint == vesting_account.mint
    )]
    pub beneficiary_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct VestingAccount {
    pub sender: Pubkey,           // 32
    pub beneficiary: Pubkey,      // 32
    pub mint: Pubkey,             // 32
    pub vault: Pubkey,            // 32
    pub total_amount: u64,        // 8
    pub start_time: i64,          // 8
    pub end_time: i64,            // 8
    pub cliff_duration: i64,      // 8
    pub amount_withdrawn: u64,    // 8
    pub bump: u8,                 // 1
}

// ========================================
// Errors
// ========================================

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount: must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid time range: end time must be after start time")]
    InvalidTimeRange,
    #[msg("Invalid cliff duration: must be non-negative")]
    InvalidCliffDuration,
    #[msg("Nothing to withdraw at this time")]
    NothingToWithdraw,
    #[msg("Insufficient funds in vault")]
    InsufficientVaultFunds,
    #[msg("Math overflow")]
    MathOverflow,
}
