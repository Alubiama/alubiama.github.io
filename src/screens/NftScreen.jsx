import { useState, useEffect } from 'react'
import { useReadContracts } from 'wagmi'
import { useSendCalls, useCallsStatus } from 'wagmi/experimental'
import { encodeFunctionData, parseEther } from 'viem'
import { NFT_MILESTONES, ZORA_COIN_ABI, PAYMASTER_URL } from '../constants'
import { useStreakData } from '../useStreak'

const REFERRER = '0x47550e121654FED9Bc17ed2f684E902a4B1fF102'
const BUY_AMOUNT = parseEther('0.001')

export default function NftScreen() {
  const { streakCount, address } = useStreakData()
  const isConnected = !!address
  const [mintingIndex, setMintingIndex] = useState(null)
  const [mintSuccess, setMintSuccess] = useState(null)
  const [imageFallbacks, setImageFallbacks] = useState({})
  // chainId check: we use Base mainnet (8453) for NFT reads
  const isBase = true // wagmi config only has Base chain

  const {
    sendCalls,
    data: callsId,
    isPending,
    error: sendError,
    reset,
  } = useSendCalls()

  const { data: callsStatus } = useCallsStatus({
    id: callsId,
    query: {
      enabled: !!callsId,
      refetchInterval: (query) =>
        query.state.data?.status === 'CONFIRMED' ? false : 1000,
    },
  })

  const isConfirming = !!callsId && callsStatus?.status !== 'CONFIRMED'
  const isSuccess = callsStatus?.status === 'CONFIRMED'

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

  // Refetch after successful mint
  useEffect(() => {
    if (isSuccess) {
      refetch()
      setMintSuccess(mintingIndex)
      setMintingIndex(null)
      reset()
      setTimeout(() => setMintSuccess(null), 4000)
    }
  }, [isSuccess])

  // Clear error state
  useEffect(() => {
    if (sendError) {
      setMintingIndex(null)
    }
  }, [sendError])

  const hasNft = (index) => {
    if (!balances || !balances[index]) return false
    const result = balances[index]
    if (result.status === 'success') {
      return BigInt(result.result) > 0n
    }
    return false
  }

  const handleMint = (nft, index) => {
    if (!address || isPending || isConfirming) return
    setMintingIndex(index)
    setMintSuccess(null)

    sendCalls({
      calls: [{
        to: nft.contract,
        data: encodeFunctionData({
          abi: ZORA_COIN_ABI,
          functionName: 'buy',
          args: [address, BUY_AMOUNT, 0n, 0n, REFERRER, 'Still Basing!'],
        }),
        value: BUY_AMOUNT,
      }],
      capabilities: PAYMASTER_URL ? {
        paymasterService: {
          url: PAYMASTER_URL,
        },
      } : undefined,
    })
  }

  if (!isConnected) {
    return (
      <div className="screen-container">
        <div className="empty-state">
          <span className="empty-icon">{"\u{1F517}"}</span>
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to view and mint NFTs</p>
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
          <p>Please switch to Base mainnet to mint NFTs</p>
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

        {sendError && (
          <div className="status-message error">
            {sendError.shortMessage || sendError.message || 'Transaction failed'}
          </div>
        )}
        {mintSuccess !== null && (
          <div className="status-message success">
            {"\u2705"} Minted successfully!
          </div>
        )}

        <div className="nft-grid">
          {NFT_MILESTONES.map((nft, index) => {
            const isUnlocked = streakCount >= nft.days
            const owned = hasNft(index)
            const isMinting = mintingIndex === index && (isPending || isConfirming)
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
                  href={`${nft.zoraUrl}?referrer=${REFERRER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nft-image-link"
                >
                  <div className="nft-image">
                    {imageFallbacks[index] ? (
                      <span className="nft-emoji">{nft.emoji}</span>
                    ) : (
                      <img
                        src={nft.imageUrl}
                        alt={nft.name}
                        className="nft-image-actual"
                        onError={() => setImageFallbacks(prev => ({ ...prev, [index]: true }))}
                      />
                    )}
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
                    <button
                      className={`claim-button ${isMinting ? 'minting' : ''}`}
                      onClick={() => handleMint(nft, index)}
                      disabled={isMinting}
                    >
                      {isMinting
                        ? (isConfirming ? 'Confirming...' : 'Minting...')
                        : PAYMASTER_URL ? 'Mint (0.001 ETH, gas free)' : 'Mint (0.001 ETH)'}
                    </button>
                  )}
                  {isUnlocked && owned && (
                    <a
                      href={`${nft.zoraUrl}?referrer=${REFERRER}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="claim-button claimed"
                      style={{ textDecoration: 'none', textAlign: 'center', display: 'block' }}
                    >
                      {"\u2705"} Owned - View on Zora
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
