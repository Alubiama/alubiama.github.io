/**
 * Daily Quests Configuration
 *
 * Quest types:
 * - 'link': Opens external dapp, user self-reports completion
 * - 'verify': Auto-verifies on-chain (future)
 */

export const DAILY_QUESTS = [
  {
    id: 'swap-uniswap',
    title: 'Swap on Uniswap',
    description: 'Make any swap on Uniswap',
    points: 10,
    emoji: '🦄',
    type: 'link',
    url: 'https://app.uniswap.org/swap?chain=base',
    learnMore: 'Uniswap is the largest decentralized exchange',
  },
  {
    id: 'mint-zora',
    title: 'Mint on Zora',
    description: 'Mint any free NFT on Zora',
    points: 10,
    emoji: '✨',
    type: 'link',
    url: 'https://zora.co/explore',
    learnMore: 'Zora is an NFT marketplace built on Base',
  },
  {
    id: 'swap-aerodrome',
    title: 'Swap on Aerodrome',
    description: 'Trade on the largest Base DEX',
    points: 10,
    emoji: '✈️',
    type: 'link',
    url: 'https://aerodrome.finance/swap',
    learnMore: 'Aerodrome is the native DEX of Base',
  },
  {
    id: 'bridge-base',
    title: 'Bridge to Base',
    description: 'Bridge any amount to Base',
    points: 15,
    emoji: '🌉',
    type: 'link',
    url: 'https://bridge.base.org',
    learnMore: 'The official Base bridge from Ethereum',
  },
  {
    id: 'basename',
    title: 'Get a Basename',
    description: 'Register your .base name',
    points: 20,
    emoji: '🏷️',
    type: 'link',
    url: 'https://www.base.org/names',
    learnMore: 'Basenames are your onchain identity',
  },
  {
    id: 'cast-warpcast',
    title: 'Cast on Warpcast',
    description: 'Post something on Farcaster',
    points: 5,
    emoji: '📢',
    type: 'link',
    url: 'https://warpcast.com',
    learnMore: 'Farcaster is a decentralized social network',
  },
  {
    id: 'explore-basescan',
    title: 'Explore Basescan',
    description: 'Check your transactions on Basescan',
    points: 5,
    emoji: '🔍',
    type: 'link',
    url: 'https://basescan.org',
    learnMore: 'Basescan is the block explorer for Base',
  },
];

// Get today's quest (rotates daily)
export function getTodayQuest() {
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const questIndex = dayOfYear % DAILY_QUESTS.length;
  return DAILY_QUESTS[questIndex];
}

// Quest completion storage key
export const QUEST_STORAGE_KEY = 'stillbasing_quests';

// Get completed quests from localStorage
export function getCompletedQuests(address) {
  if (!address) return {};
  try {
    const data = localStorage.getItem(`${QUEST_STORAGE_KEY}_${address.toLowerCase()}`);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Mark quest as completed
export function markQuestCompleted(address, questId) {
  if (!address) return;
  const completed = getCompletedQuests(address);
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  completed[today] = questId;
  localStorage.setItem(
    `${QUEST_STORAGE_KEY}_${address.toLowerCase()}`,
    JSON.stringify(completed)
  );
}

// Check if today's quest is completed
export function isTodayQuestCompleted(address) {
  const completed = getCompletedQuests(address);
  const today = new Date().toISOString().split('T')[0];
  return !!completed[today];
}

// Get total quest points
export function getTotalQuestPoints(address) {
  const completed = getCompletedQuests(address);
  let total = 0;
  for (const date in completed) {
    const questId = completed[date];
    const quest = DAILY_QUESTS.find(q => q.id === questId);
    if (quest) total += quest.points;
  }
  return total;
}

// Get quest completion count
export function getQuestCompletionCount(address) {
  const completed = getCompletedQuests(address);
  return Object.keys(completed).length;
}
