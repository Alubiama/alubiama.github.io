// StreakTracker contract (deploy and update this address)
export const STREAK_CONTRACT = "0x0000000000000000000000000000000000000000"; // TODO: Update after deployment

// StreakTracker ABI
export const STREAK_TRACKER_ABI = [
  {
    inputs: [],
    name: "checkIn",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "user", type: "address" }],
    name: "getStatus",
    outputs: [
      { name: "currentStreak", type: "uint32" },
      { name: "longestStreak", type: "uint32" },
      { name: "lastCheckIn", type: "uint40" },
      { name: "totalCheckIns", type: "uint32" },
      { name: "canCheckIn", type: "bool" },
      { name: "timeUntilCheckIn", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "addresses", type: "address[]" }],
    name: "getStreaks",
    outputs: [{ name: "streaks", type: "uint32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "user", type: "address" },
      { indexed: false, name: "newStreak", type: "uint32" },
      { indexed: false, name: "timestamp", type: "uint40" },
    ],
    name: "CheckIn",
    type: "event",
  },
];

// NFT contract addresses on Base
export const NFT_CONTRACTS = {
  day1: "0x855831959f46c068977ea2230e86206b3350e674",
  day7: "0xecaf21b93968935d73874badf1e9a0f5e4e72031",
  day14: "0xc23d011ded4c62fb97236ba49794f030917f31ee",
  day25: "0x8a2702f23ebee8479039484d8ebf9bda470b1c46",
  day50: "0xc2b26e9d10a57c9d017177c03bb3afcbec546329",
  day100: "0x41af3f1695186ac66fd4ef2e945d8d496e7782ce",
  day500: "0xfa4c3408b9e637ba019084e78803dd26655e0331",
};

// NFT milestones with Zora integration
export const NFT_MILESTONES = [
  { days: 1, name: "Still Basing: Day 1", description: "First day streak milestone", emoji: "\u{1F535}", contract: NFT_CONTRACTS.day1, ticker: "BASED1", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day1}`, imageUrl: "/nft/day1.png" },
  { days: 7, name: "Still Basing: Day 7", description: "One week streak milestone", emoji: "\u{1F440}", contract: NFT_CONTRACTS.day7, ticker: "BASED7", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day7}`, imageUrl: "/nft/day7.png" },
  { days: 14, name: "Still Basing: Day 14", description: "Two weeks streak milestone", emoji: "\u{1F5FF}", contract: NFT_CONTRACTS.day14, ticker: "BASED14", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day14}`, imageUrl: "/nft/day14.png" },
  { days: 25, name: "Still Basing: Day 25", description: "Twenty-five days streak milestone", emoji: "\u{1F300}", contract: NFT_CONTRACTS.day25, ticker: "BASED25", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day25}`, imageUrl: "/nft/day25.png" },
  { days: 50, name: "Still Basing: Day 50", description: "Fifty days streak milestone", emoji: "\u{1F30A}", contract: NFT_CONTRACTS.day50, ticker: "BASED50", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day50}`, imageUrl: "/nft/day50.png" },
  { days: 100, name: "Still Basing: Day 100", description: "One hundred days streak milestone", emoji: "\u{1F525}", contract: NFT_CONTRACTS.day100, ticker: "BASED100", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day100}`, imageUrl: "/nft/day100.png" },
  { days: 500, name: "Still Basing: Day 500", description: "Legend status - 500 days streak", emoji: "\u{1F451}", contract: NFT_CONTRACTS.day500, ticker: "BASED500", zoraUrl: `https://zora.co/coin/base:${NFT_CONTRACTS.day500}`, imageUrl: "/nft/day500.png" },
];

// Achievement milestones
export const ACHIEVEMENT_MILESTONES = [
  { day: 1, emoji: "\u{1F3C6}", title: "First Step!", description: "You started your journey" },
  { day: 3, emoji: "\u{1F525}", title: "Consistent!", description: "3 base streaks in a row" },
  { day: 7, emoji: "\u{1F451}", title: "OG Baser!", description: "One week base streak" },
  { day: 14, emoji: "\u2B50", title: "Two Weeks!", description: "Halfway to a month" },
  { day: 30, emoji: "\u{1F48E}", title: "Legend!", description: "One month base streak" },
  { day: 100, emoji: "\u{1F680}", title: "Unstoppable!", description: "100 base streaks" },
];

// Zora Coin buy ABI
export const ZORA_COIN_ABI = [
  {
    inputs: [
      { name: "recipient", type: "address" },
      { name: "orderSize", type: "uint256" },
      { name: "minAmountOut", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
      { name: "tradeReferrer", type: "address" },
      { name: "comment", type: "string" },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

// Streak storage key prefix (wallet-tied)
export const STREAK_KEY_PREFIX = "stillbasing_streak_";

// Debug whitelist
export const DEBUG_WHITELIST = ["0x47550e121654FED9Bc17ed2f684E902a4B1fF102"];

// Basing level text
export function getBasingLevel(count) {
  const n = Math.max(1, count);
  return "Still Ba" + "s".repeat(n) + "ing";
}

// Get next milestone
export function getNextMilestone(currentCount) {
  return ACHIEVEMENT_MILESTONES.find(m => m.day > currentCount) || null;
}

// Get unlocked milestones
export function getUnlockedMilestones(currentCount) {
  return ACHIEVEMENT_MILESTONES.filter(m => m.day <= currentCount);
}

// Find milestone by day
export function getMilestoneByDay(day) {
  return ACHIEVEMENT_MILESTONES.find(m => m.day === day) || null;
}
