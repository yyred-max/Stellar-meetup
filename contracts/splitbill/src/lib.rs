#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, Address, Env, String,
    Symbol, Vec,
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

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum SplitBillError {
    AlreadyPaid = 1,
    NotAMember = 2,
    IncorrectAmount = 3,
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

    pub fn add_member(
        env: Env,
        group_id: u64,
        owner: Address,
        member: Address,
        share_amount: i128,
    ) -> String {
        owner.require_auth();

        let mut members: Vec<Member> = env
            .storage()
            .instance()
            .get(&MEMBER_DATA)
            .unwrap_or(Vec::new(&env));

        let member_data = Member {
            group_id,
            address: member.clone(),
            share_amount,
            has_paid: false,
        };

        members.push_back(member_data);
        env.storage().instance().set(&MEMBER_DATA, &members);

        let mut groups: Vec<Group> = env
            .storage()
            .instance()
            .get(&GROUP_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..groups.len() {
            let mut g = groups.get(i).unwrap();

            if g.id == group_id {
                g.total_members += 1;
                groups.set(i, g);
                break;
            }
        }

        env.storage().instance().set(&GROUP_DATA, &groups);

        env.events()
            .publish((symbol_short!("m_add"), group_id), member);

        String::from_str(&env, "Member berhasil ditambahkan")
    }
}

mod test;