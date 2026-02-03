# Still Basing - Project Context

> Read this file at the start of every new session to avoid re-exploring the codebase.

## What is this?
Daily streak tracker mini app on Base blockchain. Users press a button once per day, grow their streak, earn achievements, and collect NFT milestones on Zora. Deployed as a Farcaster Mini App inside base.app.

## Tech stack
- **React 18 + Vite 6** - SPA, no SSR
- **wagmi v2** + @tanstack/react-query - wallet connections, contract reads
- **@farcaster/miniapp-sdk** - Mini App SDK (ready signal, wallet provider, isInMiniApp detection)
- **@coinbase/onchainkit** - Identity, Avatar, Name components
- **wagmi/experimental** - useSendCalls, useCallsStatus (EIP-5792 batch transactions)
- **viem** - contract encoding, ETH parsing

## Deployment
- **Hosted on GitHub Pages** at https://alubiama.github.io/
- **Build flow**: `npm run build` -> dist/ -> manually copy `dist/assets/` and `dist/index.html` to repo root
- **Root-served**: GitHub Pages serves from repo root, NOT from dist/
- **Static files at root**: images (icons, splash, screenshots, og), configs, .well-known/

## Key files (edit these)
| File | Purpose |
|------|---------|
| `src/main.jsx` | Wagmi config, providers (farcasterFrame + injected + coinbaseWallet connectors) |
| `src/App.jsx` | Main app: WalletButton, tab navigation, sdk.actions.ready(), auto-connect in frame |
| `src/farcasterConnector.js` | Custom wagmi connector using sdk.wallet.ethProvider |
| `src/constants.js` | NFT contract addresses (7 Zora coins), achievement milestones, ABI, helpers |
| `src/screens/PlayScreen.jsx` | Main button, 24h cooldown, streak logic, animations |
| `src/screens/StatsScreen.jsx` | Stats display (streak, longest, achievements count) |
| `src/screens/AchievementsScreen.jsx` | Achievement grid (6 milestones) |
| `src/screens/NftScreen.jsx` | NFT minting via useSendCalls, balanceOf checks, Zora links |
| `src/index.css` | All styling (dark mode, mobile-first, animations) |

## Config files (served directly)
| File | Purpose |
|------|---------|
| `.well-known/farcaster.json` | **THE manifest** - accountAssociation + miniapp metadata |
| `src/public/.well-known/farcaster.json` | Source copy (Vite copies to dist/.well-known/) |
| `app/.well-known/farcaster.json` | Mirror copy for /app path |
| `manifest.json` | PWA manifest (clean, no Farcaster fields) |
| `frame.json` | Legacy frame embed config (keep for backward compat) |
| `src/index.html` | Source HTML with fc:miniapp meta tag |

## Data storage
- **localStorage** with wallet-specific keys: `stillbasing_streak_[address]`
- Format: `{ lastPressTime: timestamp, streakCount: number }`
- Cooldown: 24 hours per press, 48+ hours = streak reset to 1
- Longest streak: `stillbasing_longest`
- Legacy key: `stillbasing_streak` (non-wallet)

## NFT contracts (Base mainnet)
Day 1, 7, 14, 25, 50, 100, 500 - all Zora Coins, 0.001 ETH mint cost.
Addresses in `src/constants.js`.

## Build & deploy commands
```bash
npm install                        # install deps
npm run build                      # vite build -> dist/
rm -rf assets/* && cp -r dist/assets/* assets/  # update root assets
cp dist/index.html index.html      # update root index.html
git add . && git commit && git push # deploy via GitHub Pages
```

## Farcaster account
- FID: 571426
- Domain: alubiama.github.io (verified via accountAssociation signature)

## Paymaster (optional gasless minting)
- Cloudflare Worker proxy at `paymaster-proxy/worker.js`
- Requires `VITE_PAYMASTER_URL` env var
- If not set, minting requires user to pay gas
