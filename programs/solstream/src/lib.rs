use anchor_lang::prelude::*;

declare_id!("C44y98NwZv9wbCZXYfY114tbYCgyZB2L5mEZ98ySAKdx");

#[program]
pub mod solstream {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
