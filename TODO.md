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

## Completed: base.app Integration
- [x] App is live and working inside base.app
- [x] Wallet connects correctly in Farcaster frame
- [x] farcaster.json validated (frame + miniapp sections identical)
- [x] StatsScreen/AchievementsScreen fixed to read wallet-specific streak
- [x] Added "Come back tomorrow." hint text under cooldown timer

## Architecture Improvements
- [x] Code review: extracted shared useStreak hook, fixed wallet-specific longest streak
- [x] Fixed innerHTML XSS pattern in NftScreen (now uses React state)
- [x] Fixed missing useEffect dependencies in App.jsx
- [x] Fixed toast timer cleanup in PlayScreen
- [ ] Consider code-splitting (main bundle is 1MB+ before gzip)

## Completed: Paymaster (gasless minting)
- [x] Get CDP API key from Coinbase Developer Platform
- [x] Set up proxy server for paymaster URL (Cloudflare Worker at still-basing-paymaster.alubiama.workers.dev)
- [x] Integrate paymaster in NftScreen.jsx
- [ ] Claim Paymaster Credits ($500) on base.dev (user does manually)
- [ ] Test gasless NFT minting (when Day 14 NFT unlocks)

## Priority: Features (ranked by grant impact)
- [x] Social sharing: "Share your streak" button → Farcaster cast composer
- [x] Notifications: "Enable daily reminders" button → sdk.actions.addMiniApp()
- [x] Notification worker template (notification-worker/) — deploy to Cloudflare
- [x] Lazy-load screens (Stats, Achievements, NFT) for faster initial load
- [x] On-chain streaks: StreakTracker.sol smart contract + frontend integration
- [x] Deploy StreakTracker contract to Base mainnet (0x8a13148BAd3b1275A67AB66C09ee1Dcf11fA9134)
- [x] Leaderboard: top streaks on Base (LeaderboardScreen)
- [ ] Deploy notification worker + add webhookUrl to farcaster.json (user does manually)
- [ ] Daily Base Challenge: micro-tasks for learning Base (LOW - save for later)
- [ ] Verify contract on Basescan (makes it look professional)

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
- src/useOnChainStreak.js -- on-chain streak hook (wagmi)
- contracts/StreakTracker.sol -- on-chain streak smart contract
- scripts/deploy.js -- Hardhat deployment script
- hardhat.config.js -- Hardhat config for Base
- .well-known/farcaster.json -- THE manifest
- PROJECT_CONTEXT.md -- full context for new sessions
