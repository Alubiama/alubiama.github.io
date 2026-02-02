# Still Basing -- TODO

## Source: /home/user/still-basing-src
## Deploy: /home/user/alubiama.github.io
## Branch: claude/replace-farcaster-minikit-HhKFf

---

## Completed
- [x] Replace Farcaster SDK with MiniKit
- [x] Rabby/injected wallet support
- [x] Fix 5 NFT contract addresses
- [x] Direct mint via useWriteContract -> useSendCalls (EIP-5792)
- [x] Basename + Avatar instead of raw 0x address
- [x] 24h cooldown from press timestamp (not UTC)
- [x] sdk.actions.ready() for frame readiness
- [x] farcaster.json with frame + miniapp keys
- [x] Farcaster frame connector + auto-connect in frame
- [x] Promo image 1242x648
- [x] Base App Submission form submitted

---

## Priority 1: Paymaster (gasless minting)
- [ ] Claim Paymaster Credits ($500) on base.dev (user does manually)
- [ ] Get CDP API key from Coinbase Developer Platform
- [ ] Integrate paymaster into useSendCalls -- add capabilities.paymasterService
- [ ] Set up proxy server for paymaster URL (don't expose raw CDP key on frontend)
- [ ] Test gasless NFT minting

## Priority 2: Manifest & metadata
- [ ] Update farcaster.json: add primaryCategory, screenshotUrls, heroImageUrl, subtitle, description, tagline, tags
- [ ] Only ~30 of hundreds of mini apps have this -- competitive advantage for getting featured

## Priority 3: Builder programs (user does manually)
- [ ] Register on talent.app for Builder Rewards (2 ETH/week for top builders)
- [ ] Go through launchonbase.xyz checklist (Launch + Post-launch tabs)
- [ ] Apply for Base Builder Grant (1-5 ETH) at docs.base.org/get-started/get-funded
- [ ] Apply for Base Gasless Campaign ($15k gas credits) via Google Form

## Priority 4: Features to grow engagement
- [ ] Daily Base Challenge: micro-tasks for learning Base (turns clicker into onboarding tool)
- [ ] On-chain streaks: smart contract instead of localStorage
- [ ] Share card: generate streak image for sharing on Farcaster/X
- [ ] Leaderboard: top streaks table
- [ ] Notifications via Base App: reminder to press daily

---

## Tech stack
- React + Vite
- wagmi v2 + @tanstack/react-query
- @coinbase/onchainkit (Identity, Avatar, Name)
- @farcaster/frame-sdk (sdk.actions.ready, sdk.wallet.ethProvider, sdk.isInMiniApp)
- wagmi/experimental (useSendCalls, useCallsStatus for EIP-5792)
- Custom farcasterFrame() wagmi connector for in-frame wallet

## Key files
- src/main.jsx -- wagmi config with farcasterFrame + injected + coinbaseWallet connectors
- src/App.jsx -- WalletButton, auto-connect in frame, sdk.actions.ready()
- src/farcasterConnector.js -- custom wagmi connector using sdk.wallet.ethProvider
- src/screens/PlayScreen.jsx -- main play screen, 24h cooldown
- src/screens/NftScreen.jsx -- NFT minting with useSendCalls (EIP-5792)
- src/constants.js -- NFT contract addresses, ABI
- public/.well-known/farcaster.json -- manifest with frame + miniapp keys

## Contact
- Email: alubiama@gmail.com
- Telegram: @alubiamabez
- Discord: alubiama (gsdtvn#8120)
