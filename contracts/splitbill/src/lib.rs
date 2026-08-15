#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug)]
pub struct Group {
    pub id: u64,
    pub name: String,
    pub owner: Address,
    pub total_members: u32,
    pub members_paid: u32,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct Member {
    pub group_id: u64,
    pub address: Address,
    pub share_amount: i128,
    pub has_paid: bool,
}

const GROUP_DATA: Symbol = symbol_short!("GROUPS");
const MEMBER_DATA: Symbol = symbol_short!("MEMBERS");

#[contract]
pub struct SplitBillContract;

#[contractimpl]
impl SplitBillContract {}

mod test;