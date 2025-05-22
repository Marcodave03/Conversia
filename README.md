# 🚀 Conversia: Talk, Feel, Own — Only to You

![Conversia Logo](https://drive.google.com/uc?id=15o5BtiVAe2HgV41nAznGoWRc7pHz-I-K)

### 🎭 Track: Entertainment & Culture  
Conversia equips users with actual **digital ownership**, as each avatar and background is **minted as an NFT on the Sui Blockchain**.

Unlike traditional platforms where users rent access to a library of assets, Conversia ensures users **truly own** what they create. From the very beginning, **transparency and trust** are core values integrated into the platform.

---

## 🌐 Project Links

- **Homepage (Website)**: [https://conversia-flame.vercel.app/](https://conversia-flame.vercel.app/)
- **X (Twitter) Page**: [Conversia__](https://x.com/Conversia__)
- **GitHub Repo**: [github.com/Marcodave03/Conversia](https://github.com/Marcodave03/Conversia)

---

## 📦 Sui Blockchain Info

- **Network**: Testnet  
- **Package ID**: `0x259d94a80abe762c81b401d9c5e41db7cc83081fda1dad00952c5058302f4f8a`

---

## 🛠️ Smart Contract Development

```bash
# Build Docker image
docker build -t conversia-nft .

# Run container and enter bash
docker run -it --rm -v $PWD:/app conversia-sui bash

# Inside container
cd ConversiaAvatarNFT

# Build the Move smart contract
sui move build

# Run tests (optional)
sui move test
```

---

## 📬 Send Sample Message from Frontend

```json
{
  "sui_id": "0x123",
  "avatarId": "avatar_knight",
  "message": "Hi Maya, how are you?"
}
```

---

## 🧪 Check Deployed Objects

```bash
sui client objects --address 0x9e8ef56f9eacf829fe8a52ea44da4aee10b6602784168f5de91f8a18663bc665
```

---

## 🧠 3D Model + AI Chat Integration

To serve your app with live preview:

```bash
ngrok http 5173
```

---

## ⚙️ Frontend: React + TypeScript + Vite

This project uses **React + TypeScript + Vite** with hot module replacement (HMR) and ESLint.

### ESLint Config Recommendations

To expand type-aware linting:

```js
export default tseslint.config({
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

Also consider:
- Replace `tseslint.configs.recommended` with `recommendedTypeChecked`
- Add plugin: `eslint-plugin-react`
  
```js
import react from 'eslint-plugin-react'

export default tseslint.config({
  settings: { react: { version: '18.3' } },
  plugins: { react },
  rules: {
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

---

## 📽️ Submission Assets

- **Pitch Deck**: *(To be linked)*
- **Demo Video**: *(To be linked)*

---