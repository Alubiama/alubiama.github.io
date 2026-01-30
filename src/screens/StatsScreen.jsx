import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import {
  STREAK_KEY,
  getBasingLevel,
  getUnlockedMilestones,
  getNextMilestone,
} from '../constants'

export default function StatsScreen() {
  const { address, isConnected } = useAccount()
  const [streakCount, setStreakCount] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  useEffect(() => {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        setStreakCount(data.streakCount || 0)

        const longest = localStorage.getItem('stillbasing_longest') || '0'
        const longestVal = parseInt(longest, 10)
        if (data.streakCount > longestVal) {
          localStorage.setItem('stillbasing_longest', data.streakCount.toString())
          setLongestStreak(data.streakCount)
        } else {
          setLongestStreak(longestVal)
        }
      } catch (err) {
        console.error('Failed to parse streak data:', err)
      }
    }
  }, [])

  const unlocked = getUnlockedMilestones(streakCount)
  const next = getNextMilestone(streakCount)

  return (
    <div className="screen-container stats-screen">
      <div className="stats-content">
        <h1 className="screen-title">Stats</h1>
        <p className="screen-subtitle">Your basing journey</p>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{streakCount}</span>
            <span className="stat-label">Current Streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{longestStreak}</span>
            <span className="stat-label">Longest Streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{unlocked.length}</span>
            <span className="stat-label">Achievements</span>
          </div>
        </div>

        {next && (
          <div className="milestone-progress">
            <div className="progress-header">
              <h3>Next Achievement</h3>
            </div>
            <p className="progress-subtitle">
              {next.emoji} {next.title} — {next.day - streakCount} base streaks to go
            </p>
          </div>
        )}

        {!next && streakCount > 0 && (
          <div className="milestone-progress completed">
            <div className="progress-header">
              <h3>{'\u{1F389}'} All Achievements Unlocked!</h3>
            </div>
            <p className="progress-subtitle">
              You've completed all milestones. You're a legend!
            </p>
          </div>
        )}

        <div className="text-preview">
          <h3>Your "Basing" Level</h3>
          <div className="preview-text">{getBasingLevel(streakCount || 1)}</div>
        </div>

        <div className="wallet-info">
          <h3>Wallet</h3>
          <p className="wallet-address">
            {isConnected && address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : 'Not connected'}
          </p>
        </div>
      </div>
    </div>
  )
}
