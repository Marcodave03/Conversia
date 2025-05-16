# run sui blockchain 
docker build -t conversia-nft .
# Enter container
docker run -it --rm -v $PWD:/app conversia-sui bash

cd ConversiaAvatarNFT

# Build the smart contract
sui move build

# To test it (optional)
sui move test



Total number of linter warnings suppressed: 1 (unique lints: 1)
Skipping dependency verification
  {
    "digest": "DyAaJgtpALyG7bbgxTKuTjoBhHZ6dHqqEmifY23GK6Zd",
    "transaction": {
      "data": {
        "messageVersion": "v1",
        "transaction": {
          "kind": "ProgrammableTransaction",
          "inputs": [
            {
              "type": "pure",
              "valueType": "address",
              "value": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
            }
          ],
          "transactions": [
            {
              "Publish": [
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000002"
              ]
            },
            {
              "TransferObjects": [
                [
                  {
                    "Result": 0
                  }
                ],
                {
                  "Input": 0
                }
              ]
            }
          ]
        },
        "sender": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665",
        "gasData": {
          "payment": [
            {
              "objectId": "0x7f5011142d17204f921172051f1d41febe30099e26b2ab0dbd79bfd26f66aafd",
              "version": 349179472,
              "digest": "FbkQz728QShUVkBh4NE6DDMmRWj59VHgkzz7B7cxicFx"
            }
          ],
          "owner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665",
          "price": "1000",
          "budget": "100000000"
        }
      },
      "txSignatures": [
        "AEYkrxCCnQKHVp/cGuUdonN96wGylhMkyBsmus+sfjCtVWXEIAfP1UZJgpYdD+LaC6ebk85pMSDFVs8snnxU6w7O4gfVeUj2NtG1Xkw4eD+reH4tQ+e5+eeO5tiqW8w2Mg=="
      ]
    },
    "effects": {
      "messageVersion": "v1",
      "status": {
        "status": "success"
      },
      "executedEpoch": "736",
      "gasUsed": {
        "computationCost": "1000000",
        "storageCost": "7812800",
        "storageRebate": "978120",
        "nonRefundableStorageFee": "9880"
      },
      "modifiedAtVersions": [
        {
          "objectId": "0x7f5011142d17204f921172051f1d41febe30099e26b2ab0dbd79bfd26f66aafd",
          "sequenceNumber": "349179472"
        }
      ],
      "transactionDigest": "DyAaJgtpALyG7bbgxTKuTjoBhHZ6dHqqEmifY23GK6Zd",
      "created": [
        {
          "owner": "Immutable",
          "reference": {
            "objectId": "0x2156c74c761ba38f11638910b6cdd3424fc411fc12ba782e9b125b304cd4f206",
            "version": 1,
            "digest": "3pZGXq8Lu9GmSe5WRAZGAPmkvZszSstxiyLccccdhvTe"
          }
        },
        {
          "owner": {
            "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
          },
          "reference": {
            "objectId": "0xfa533b4d4d01370aeb10a56df8ca9f4f28c5f62d546049e579f1cdefa5623d17",
            "version": 349179473,
            "digest": "HVQ6KdxfKmLKMVZWNMHUvepcoxbcr8GeDK5S2jpq8HVq"
          }
        }
      ],
      "mutated": [
        {
          "owner": {
            "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
          },
          "reference": {
            "objectId": "0x7f5011142d17204f921172051f1d41febe30099e26b2ab0dbd79bfd26f66aafd",
            "version": 349179473,
            "digest": "5DxnY9Cjm7HNYuqWY28YuDsUp8y3rGa3Qj9iuHerjrrC"
          }
        }
      ],
      "gasObject": {
        "owner": {
          "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
        },
        "reference": {
          "objectId": "0x7f5011142d17204f921172051f1d41febe30099e26b2ab0dbd79bfd26f66aafd",
          "version": 349179473,
          "digest": "5DxnY9Cjm7HNYuqWY28YuDsUp8y3rGa3Qj9iuHerjrrC"
        }
      },
      "dependencies": [
        "6pZ2bpkwLwnCH4qdHS1NcJypXLFUNvSHRKfKXhZvXQuo",
        "C5xG5R82uskKJatwXq5r3f5t2XzcCVKyb7Zgdn628gdP"
      ]
    },
    "events": [],
    "objectChanges": [
      {
        "type": "mutated",
        "sender": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665",
        "owner": {
          "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
        },
        "objectType": "0x2::coin::Coin<0x2::sui::SUI>",
        "objectId": "0x7f5011142d17204f921172051f1d41febe30099e26b2ab0dbd79bfd26f66aafd",
        "version": "349179473",
        "previousVersion": "349179472",
        "digest": "5DxnY9Cjm7HNYuqWY28YuDsUp8y3rGa3Qj9iuHerjrrC"
      },
      {
        "type": "published",
        "packageId": "0x2156c74c761ba38f11638910b6cdd3424fc411fc12ba782e9b125b304cd4f206",
        "version": "1",
        "digest": "3pZGXq8Lu9GmSe5WRAZGAPmkvZszSstxiyLccccdhvTe",
        "modules": [
          "AvatarNFT"
        ]
      },
      {
        "type": "created",
        "sender": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665",
        "owner": {
          "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
        },
        "objectType": "0x2::package::UpgradeCap",
        "objectId": "0xfa533b4d4d01370aeb10a56df8ca9f4f28c5f62d546049e579f1cdefa5623d17",
        "version": "349179473",
        "digest": "HVQ6KdxfKmLKMVZWNMHUvepcoxbcr8GeDK5S2jpq8HVq"
      }
    ],
    "balanceChanges": [
      {
        "owner": {
          "AddressOwner": "0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665"
        },
        "coinType": "0x2::sui::SUI",
        "amount": "-7834680"
      }
    ],
    "timestampMs": "1747366157752",
    "confirmedLocalExecution": true,
    "checkpoint": "196493374"
  }
PS C:\2.Code Repository\200.Projects\Conversia\NFT> 





3D Model with chatGPT

ngrok http 5173
















# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```




{
  "sui_id": "0x123",
  "avatarId": "avatar_knight",
  "message": "Hi Maya, how are you?"
}  sends from frontend