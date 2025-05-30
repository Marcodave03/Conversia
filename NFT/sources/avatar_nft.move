module Conversia::AvatarNFT {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context;

    struct Avatar has key, store {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,              // ✅ changed from image_url
        metadata_url: vector<u8>,
        owner: address
    }

    #[allow(lint(custom_state_change))]
    public fun transfer_avatar(avatar: Avatar, recipient: address) {
        transfer::transfer(avatar, recipient);
    }

    public entry fun mint_avatar(
        name: vector<u8>,
        description: vector<u8>,
        url: vector<u8>,
        metadata_url: vector<u8>,
        recipient: address,
        ctx: &mut tx_context::TxContext
    ) {
        let avatar = Avatar {
            id: object::new(ctx),
            name,
            description,
            url,
            metadata_url,
            owner: recipient
        };

        transfer::transfer(avatar, recipient); // ✅ now correct
    }

}
