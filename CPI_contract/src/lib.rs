use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    instruction::Instruction,
    program::invoke,
    pubkey::Pubkey,
};

use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let mut acc = accounts.iter();
    let data_account = next_account_info(&mut acc)?;
    let double_prog = next_account_info(&mut acc)?;

    let ix = solana_program::instruction::Instruction {
        program_id: *double_prog.key,
        accounts: vec![
            solana_program::instruction::AccountMeta::new(*data_account.key, false),
            
        ],
        data: vec![],
    };

    invoke(&ix, &[data_account.clone(), double_prog.clone()])?;

    Ok(())
}
