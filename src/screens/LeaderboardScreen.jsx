import { useState, useEffect } from 'react'
import { usePublicClient } from 'wagmi'
import { Identity, Name, Avatar } from '@coinbase/onchainkit/identity'
import { STREAK_CONTRACT, STREAK_TRACKER_ABI } from '../constants'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export default function LeaderboardScreen() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (STREAK_CONTRACT === ZERO_ADDRESS) {
      setLoading(false)
      return
    }

    async function fetchLeaderboard() {
      try {
        // Get CheckIn events to find all users
        const logs = await publicClient.getLogs({
          address: STREAK_CONTRACT,
          event: {
            type: 'event',
            name: 'CheckIn',
            inputs: [
              { indexed: true, name: 'user', type: 'address' },
              { indexed: false, name: 'newStreak', type: 'uint32' },
              { indexed: false, name: 'timestamp', type: 'uint40' },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        })

        // Get unique addresses
        const uniqueAddresses = [...new Set(logs.map(log => log.args.user))]

        if (uniqueAddresses.length === 0) {
          setLeaders([])
          setLoading(false)
          return
        }

        // Batch fetch current streaks
        const streaks = await publicClient.readContract({
          address: STREAK_CONTRACT,
          abi: STREAK_TRACKER_ABI,
          functionName: 'getStreaks',
          args: [uniqueAddresses],
        })

        // Combine and sort
        const leaderboard = uniqueAddresses
          .map((addr, i) => ({
            address: addr,
            streak: Number(streaks[i]),
          }))
          .filter(l => l.streak > 0)
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 50) // Top 50

        setLeaders(leaderboard)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
        setError('Failed to load leaderboard')
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [publicClient])

  if (STREAK_CONTRACT === ZERO_ADDRESS) {
    return (
      <div className="screen-container">
        <div className="leaderboard-container">
          <h2 className="leaderboard-title">Leaderboard</h2>
          <p className="leaderboard-empty">Coming soon...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="screen-container">
        <div className="leaderboard-container">
          <h2 className="leaderboard-title">Leaderboard</h2>
          <div className="loading-spinner" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="screen-container">
        <div className="leaderboard-container">
          <h2 className="leaderboard-title">Leaderboard</h2>
          <p className="leaderboard-error">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-container">
      <div className="leaderboard-container">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <p className="leaderboard-subtitle">Top streaks on Base</p>

        {leaders.length === 0 ? (
          <p className="leaderboard-empty">No streaks recorded yet. Be the first!</p>
        ) : (
          <div className="leaderboard-list">
            {leaders.map((leader, index) => (
              <div key={leader.address} className="leaderboard-row">
                <span className="leaderboard-rank">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </span>
                <div className="leaderboard-user">
                  <Identity address={leader.address} schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9">
                    <Avatar className="leaderboard-avatar" />
                    <Name className="leaderboard-name" />
                  </Identity>
                </div>
                <span className="leaderboard-streak">
                  {leader.streak} {'s'.repeat(Math.min(leader.streak, 5))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
