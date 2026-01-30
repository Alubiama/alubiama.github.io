import { useState, useEffect } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import {
  NFT_MILESTONES,
  ZORA_COIN_ABI,
  STREAK_KEY_PREFIX,
} from '../constants'

export default function NftScreen() {
  const { address, isConnected, chainId } = useAccount()
  const [mintStatus, setMintStatus] = useState(null)
  const [mintError, setMintError] = useState(null)
  const [mintLoading, setMintLoading] = useState(null)
  const [streakCount, setStreakCount] = useState(1)
  const isBase = chainId === 8453

  // Load streak
  useEffect(() => {
    if (address) {
      try {
        const key = STREAK_KEY_PREFIX + address.toLowerCase()
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          setStreakCount(data.streakCount || 1)
        }
      } catch (err) {
        console.error('Failed to load streak:', err)
      }
    }
  }, [address])

  // Read balances for all NFTs
  const contracts = NFT_MILESTONES.map((m) => ({
    address: m.contract,
    abi: ZORA_COIN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    chainId: 8453,
  }))

  const { data: balances, refetch } = useReadContracts({
    contracts,
    enabled: !!address && isBase,
  })

  const hasNft = (index) => {
    if (!balances || !balances[index]) return false
    const result = balances[index]
    if (result.status === 'success') {
      return BigInt(result.result) > 0n
    }
    return false
  }

  if (!isConnected) {
    return (
      <div className="screen-container">
        <div className="empty-state">
          <span className="empty-icon">{"\u{1F517}"}</span>
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to view and claim NFTs</p>
        </div>
      </div>
    )
  }

  if (!isBase) {
    return (
      <div className="screen-container">
        <div className="empty-state">
          <span className="empty-icon">{"\u{1F517}"}</span>
          <h2>Switch to Base</h2>
          <p>Please switch to Base mainnet to claim NFTs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container nft-screen">
      <div className="nft-content">
        <h1 className="screen-title">NFT Milestones</h1>
        <p className="screen-subtitle">
          Collect Zora Coins for your streak milestones
        </p>

        {mintStatus && (
          <div className={`status-message ${mintStatus}`}>
            {mintStatus === 'success'
              ? '\u2705 Transaction submitted!'
              : mintError || 'Processing...'}
          </div>
        )}

        <div className="nft-grid">
          {NFT_MILESTONES.map((nft, index) => {
            const isUnlocked = streakCount >= nft.days
            const owned = hasNft(index)
            const progress = Math.min(
              (streakCount / nft.days) * 100,
              100
            )

            return (
              <div
                key={nft.contract}
                className={`nft-card ${isUnlocked ? 'unlocked' : 'locked'} ${owned ? 'claimed' : ''}`}
              >
                <a
                  href={nft.zoraUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nft-image-link"
                >
                  <div className="nft-image">
                    <img
                      src={nft.imageUrl}
                      alt={nft.name}
                      className="nft-image-actual"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentElement.innerHTML = `<span class="nft-emoji">${nft.emoji}</span>`
                      }}
                    />
                    {!isUnlocked && (
                      <div className="nft-lock-overlay">{"\u{1F512}"}</div>
                    )}
                    {owned && <div className="nft-badge">Owned</div>}
                  </div>
                </a>

                <div className="nft-info">
                  <h3 className="nft-title">{nft.name}</h3>
                  <p className="nft-description">{nft.description}</p>
                  <p className="nft-requirement">
                    Requires {nft.days} day streak
                  </p>
                  <p className="nft-price">${nft.ticker}</p>

                  {!isUnlocked && (
                    <div className="nft-progress">
                      <div className="nft-progress-bar">
                        <div
                          className="nft-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="nft-progress-text">
                        {streakCount} / {nft.days} days
                      </span>
                    </div>
                  )}

                  {isUnlocked && !owned && (
                    <a
                      href={nft.zoraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="claim-button"
                      style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
                    >
                      View on Zora
                    </a>
                  )}
                  {owned && (
                    <a
                      href={nft.zoraUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="claim-button claimed"
                      style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
                    >
                      View on Zora
                    </a>
                  )}
                  {!isUnlocked && (
                    <button className="claim-button locked" disabled>
                      {"\u{1F512}"} Locked
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="zora-credit">
          Powered by{' '}
          <a
            href="https://zora.co/@alubiama"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zora
          </a>
        </div>
      </div>
    </div>
  )
}
