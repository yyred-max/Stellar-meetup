#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Env, String};

#[test]
fn test_create_group_and_pay() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillContract, ());
    let client = SplitBillContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let member = Address::generate(&env);

    let group = client.create_group(
        &owner,
        &String::from_str(&env, "Trip to Bali"),
    );

    client.add_member(&group.id, &owner, &member, &100);

    let result = client.pay_share(&group.id, &member, &100);

    assert_eq!(
        result,
        String::from_str(&env, "Pembayaran berhasil")
    );

    let groups = client.get_groups();
    let updated_group = groups
        .iter()
        .find(|g| g.id == group.id)
        .unwrap();

    assert_eq!(updated_group.members_paid, 1);
}

#[test]
fn test_already_paid_error() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillContract, ());
    let client = SplitBillContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let member = Address::generate(&env);

    let group = client.create_group(
        &owner,
        &String::from_str(&env, "Dinner"),
    );

    client.add_member(&group.id, &owner, &member, &50);
    client.pay_share(&group.id, &member, &50);

    let result = client.try_pay_share(&group.id, &member, &50);

    assert_eq!(
        result,
        Err(Ok(SplitBillError::AlreadyPaid))
    );
}

#[test]
fn test_incorrect_amount_error() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillContract, ());
    let client = SplitBillContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let member = Address::generate(&env);

    let group = client.create_group(
        &owner,
        &String::from_str(&env, "Dinner"),
    );

    client.add_member(&group.id, &owner, &member, &50);

    let result = client.try_pay_share(&group.id, &member, &30);

    assert_eq!(
        result,
        Err(Ok(SplitBillError::IncorrectAmount))
    );
}

#[test]
fn test_not_a_member_error() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillContract, ());
    let client = SplitBillContractClient::new(&env, &contract_id);

    let owner = Address::generate(&env);
    let stranger = Address::generate(&env);

    let group = client.create_group(
        &owner,
        &String::from_str(&env, "Dinner"),
    );

    let result = client.try_pay_share(
        &group.id,
        &stranger,
        &50,
    );

    assert_eq!(
        result,
        Err(Ok(SplitBillError::NotAMember))
    );
}