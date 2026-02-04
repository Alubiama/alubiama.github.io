import {
  getBasingLevel,
  getUnlockedMilestones,
  getNextMilestone,
  ACHIEVEMENT_MILESTONES,
} from '../constants'
import { useStreakData } from '../useStreak'

export default function StatsScreen() {
  const { streakCount, longestStreak, address } = useStreakData()

  const unlocked = getUnlockedMilestones(streakCount)
  const next = getNextMilestone(streakCount)
  const progress = (() => {
    if (!next) return 100
    const prev = unlocked[unlocked.length - 1]
    const prevDay = prev ? prev.day : 0
    return ((streakCount - prevDay) / (next.day - prevDay)) * 100
  })()

  return (
    <div className="screen-container stats-screen">
      <div className="stats-content">
        <h1 className="screen-title">Your Statistics</h1>

        <div className="stats-grid">
          <div className="stat-card large">
            <div className="stat-icon">{'\u{1F525}'}</div>
            <div className="stat-label">Current Base Streak</div>
            <div className="stat-value-large">{streakCount}</div>
            <div className="stat-sublabel">{'s'.repeat(Math.max(1, streakCount))} in Basing</div>
          </div>
          <div className="stat-card large">
            <div className="stat-icon">{'\u{1F3C6}'}</div>
            <div className="stat-label">Achievements Unlocked</div>
            <div className="stat-value-large">{unlocked.length}</div>
            <div className="stat-sublabel">of {ACHIEVEMENT_MILESTONES.length} total</div>
          </div>
          <div className="stat-card large">
            <div className="stat-icon">{'\u{1F4C8}'}</div>
            <div className="stat-label">Longest Streak</div>
            <div className="stat-value-large">{longestStreak}</div>
            <div className="stat-sublabel">base streaks</div>
          </div>
        </div>

        {next && (
          <div className="milestone-progress">
            <div className="progress-header">
              <h3>Next: {next.emoji} {next.title}</h3>
              <span className="progress-text">{Math.round(progress)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-subtitle">
              {next.day - streakCount} base streaks to next achievement
            </p>
          </div>
        )}

        {!next && streakCount >= ACHIEVEMENT_MILESTONES[ACHIEVEMENT_MILESTONES.length - 1].day && (
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
          <div className="stat-label">Wallet</div>
          <div className="stat-value-small">
            {address
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : 'Not connected'}
          </div>
        </div>
      </div>
    </div>
  )
}
