# Still Basing - TODO

## Completed
- [x] Replace @farcaster/frame-sdk with @farcaster/miniapp-sdk v0.2.1
- [x] Fix frame.json: launch_miniapp action, correct URL (was pointing to /app)
- [x] Fix manifest.json: remove invalid Farcaster fields from PWA manifest
- [x] Sync all farcaster.json copies (root, src/public, app/)
- [x] Clean old compiled assets (30+ stale files removed)
- [x] Rebuild and deploy with new SDK
- [x] Rabby/injected wallet support
- [x] Fix 5 NFT contract addresses
- [x] Direct mint via useSendCalls (EIP-5792)
- [x] Basename + Avatar (OnchainKit Identity)
- [x] 24h cooldown from press timestamp
- [x] sdk.actions.ready() for frame readiness
- [x] Farcaster frame connector + auto-connect in frame
- [x] Base App Submission form submitted
- [x] farcaster.json with full miniapp metadata (primaryCategory, screenshotUrls, heroImageUrl, etc.)
- [x] Create PROJECT_CONTEXT.md for session efficiency

---

## In Progress: base.app Integration
- [ ] Verify app works in base.app after SDK migration (test on phone)
- [ ] If still not showing in base.app directory: post app URL on Farcaster profile for indexing
- [ ] Test base.dev preview passes all checks after changes

## Architecture Improvements
- [ ] Code review: identify redundant patterns, optimize state management
- [ ] Consider code-splitting (main bundle is 1MB+ before gzip)
- [ ] Evaluate if StatsScreen/AchievementsScreen should read wallet-specific streak (currently reads legacy key)

## Priority: Paymaster (gasless minting)
- [ ] Claim Paymaster Credits ($500) on base.dev (user does manually)
- [ ] Get CDP API key from Coinbase Developer Platform
- [ ] Set up proxy server for paymaster URL (Cloudflare Worker ready at paymaster-proxy/)
- [ ] Test gasless NFT minting

## Priority: Features
- [ ] On-chain streaks: smart contract instead of localStorage
- [ ] Share card: generate streak image for sharing on Farcaster/X
- [ ] Leaderboard: top streaks table
- [ ] Notifications via Base App: reminder to press daily
- [ ] Daily Base Challenge: micro-tasks for learning Base

## Builder Programs (user does manually)
- [ ] Register on talent.app for Builder Rewards
- [ ] Go through launchonbase.xyz checklist
- [ ] Apply for Base Builder Grant (1-5 ETH)
- [ ] Apply for Base Gasless Campaign ($15k gas credits)

---

## Tech stack
- React 18 + Vite 6
- wagmi v2 + @tanstack/react-query
- @coinbase/onchainkit (Identity, Avatar, Name)
- @farcaster/miniapp-sdk (sdk.actions.ready, sdk.wallet.ethProvider, sdk.isInMiniApp)
- wagmi/experimental (useSendCalls, useCallsStatus for EIP-5792)

## Key files
- src/main.jsx -- wagmi config, providers
- src/App.jsx -- main app, wallet, sdk.actions.ready()
- src/farcasterConnector.js -- custom wagmi connector
- src/screens/PlayScreen.jsx -- main button, 24h cooldown
- src/screens/NftScreen.jsx -- NFT minting
- src/constants.js -- contracts, milestones, ABI
- .well-known/farcaster.json -- THE manifest
- PROJECT_CONTEXT.md -- full context for new sessions
