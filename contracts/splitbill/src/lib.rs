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
impl SplitBillContract {
    pub fn get_groups(env: Env) -> Vec<Group> {
        env.storage()
            .instance()
            .get(&GROUP_DATA)
            .unwrap_or(Vec::new(&env))
    }

    pub fn create_group(env: Env, owner: Address, name: String) -> Group {
        owner.require_auth();

        let mut groups: Vec<Group> = env
            .storage()
            .instance()
            .get(&GROUP_DATA)
            .unwrap_or(Vec::new(&env));

        let group = Group {
            id: env.prng().gen::<u64>(),
            name,
            owner: owner.clone(),
            total_members: 0,
            members_paid: 0,
        };

        groups.push_back(group.clone());
        env.storage().instance().set(&GROUP_DATA, &groups);

        env.events()
            .publish((symbol_short!("g_create"), group.id), owner);

        group
    }
}

mod test;