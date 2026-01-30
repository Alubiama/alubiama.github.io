// NFT contract addresses on Base
export const NFT_CONTRACTS = {
  day1: "0x0d5e5e1b42517baf5aa2c4f7b1de83f79d060834",
  day7: "0x2d3d7a30c48ab2e4e82dee709280f7e1cd087002",
  day14: "0xb3a2426f9a4be01e67c254000e69e0b5cc0a105c",
  day25: "0x397e1b944bc6aee1b63ae1c682ae06e44f508082",
  day50: "0x8fa6c0ed75dcbb9b07508d81a6d3e759e61d2d64",
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
// Legacy streak key (non-wallet)
export const STREAK_KEY = "stillbasing_streak";

// Debug whitelist
export const DEBUG_WHITELIST = ["0x47550e121654FED9Bc17ed2f684E902a4B1fF102"];

// Basing level text
export function getBasingLevel(count) {
  const n = Math.max(1, count);
  return "Still Ba" + "s".repeat(n) + "ing";
}

// Get today's date string
export function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

// Day difference between two date strings
export function dayDiff(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  const diff = Math.abs(d2 - d1);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
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
