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

    pub fn pay_share(
        env: Env,
        group_id: u64,
        member: Address,
        amount: i128,
    ) -> Result<String, SplitBillError> {
        member.require_auth();

        let mut members: Vec<Member> = env
            .storage()
            .instance()
            .get(&MEMBER_DATA)
            .unwrap_or(Vec::new(&env));

        let mut found_index: Option<u32> = None;

        for i in 0..members.len() {
            let m = members.get(i).unwrap();

            if m.group_id == group_id && m.address == member {
                found_index = Some(i);
                break;
            }
        }

        let index = found_index.ok_or(SplitBillError::NotAMember)?;
        let mut member_data = members.get(index).unwrap();

        if member_data.has_paid {
            return Err(SplitBillError::AlreadyPaid);
        }

        if amount != member_data.share_amount {
            return Err(SplitBillError::IncorrectAmount);
        }

        member_data.has_paid = true;
        members.set(index, member_data);

        env.storage().instance().set(&MEMBER_DATA, &members);

        let mut groups: Vec<Group> = env
            .storage()
            .instance()
            .get(&GROUP_DATA)
            .unwrap_or(Vec::new(&env));

        for i in 0..groups.len() {
            let mut g = groups.get(i).unwrap();

            if g.id == group_id {
                g.members_paid += 1;
                groups.set(i, g);
                break;
            }
        }

        env.storage().instance().set(&GROUP_DATA, &groups);

        env.events()
            .publish((symbol_short!("m_paid"), group_id), (member, amount));

        Ok(String::from_str(&env, "Pembayaran berhasil"))
    }

    pub fn get_members(env: Env, group_id: u64) -> Vec<Member> {
        let members: Vec<Member> = env
            .storage()
            .instance()
            .get(&MEMBER_DATA)
            .unwrap_or(Vec::new(&env));

        let mut result: Vec<Member> = Vec::new(&env);

        for i in 0..members.len() {
            let m = members.get(i).unwrap();

            if m.group_id == group_id {
                result.push_back(m);
            }
        }

        result
    }
}

mod test;