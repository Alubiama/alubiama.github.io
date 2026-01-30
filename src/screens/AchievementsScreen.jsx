import { useState, useEffect } from 'react'
import {
  STREAK_KEY,
  ACHIEVEMENT_MILESTONES,
  getUnlockedMilestones,
} from '../constants'

export default function AchievementsScreen() {
  const [streakCount, setStreakCount] = useState(0)

  useEffect(() => {
    const raw = localStorage.getItem(STREAK_KEY)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        setStreakCount(data.streakCount || 0)
      } catch (err) {
        console.error('Failed to parse streak data:', err)
      }
    }
  }, [])

  const unlocked = getUnlockedMilestones(streakCount)

  return (
    <div className="screen-container achievements-screen">
      <div className="achievements-content">
        <h1 className="screen-title">Achievements</h1>
        <p className="screen-subtitle">
          Unlock achievements by maintaining your daily streak
        </p>

        <div className="achievements-list">
          {ACHIEVEMENT_MILESTONES.map((milestone) => {
            const isUnlocked = streakCount >= milestone.day
            return (
              <div
                key={milestone.day}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <span className="achievement-emoji">{milestone.emoji}</span>
                <div className="achievement-info">
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                  <span className="achievement-requirement">
                    Day {milestone.day}
                  </span>
                </div>
                <span className="achievement-status">
                  {isUnlocked ? '\u2705' : '\u{1F512}'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
