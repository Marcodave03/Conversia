module Conversia::AvatarNFT {

    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context;

    struct Avatar has key, store {
        id: UID,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        metadata_url: vector<u8>,
        owner: address
    }

    #[allow(lint(custom_state_change))]
    public fun transfer_avatar(avatar: Avatar, recipient: address) {
        transfer::transfer(avatar, recipient);
    }

    public fun mint_avatar(
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        metadata_url: vector<u8>,
        ctx: &mut tx_context::TxContext
    ): Avatar {
        Avatar {
            id: object::new(ctx),
            name,
            description,
            image_url,
            metadata_url,
            owner: tx_context::sender(ctx)
        }
    }
}
