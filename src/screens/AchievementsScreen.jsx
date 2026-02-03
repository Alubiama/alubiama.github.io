import {
  ACHIEVEMENT_MILESTONES,
  getUnlockedMilestones,
  getNextMilestone,
} from '../constants'
import { useStreakData } from '../useStreak'

export default function AchievementsScreen() {
  const { streakCount } = useStreakData()

  const unlocked = getUnlockedMilestones(streakCount)
  const next = getNextMilestone(streakCount)

  return (
    <div className="screen-container achievements-screen">
      <div className="achievements-content">
        <h1 className="screen-title">Achievements</h1>
        <p className="screen-subtitle">
          Unlock achievements by maintaining your daily streak
        </p>

        <div className="achievements-grid">
          {ACHIEVEMENT_MILESTONES.map((milestone) => {
            const isUnlocked = streakCount >= milestone.day
            const isCurrent = next && next.day === milestone.day
            const progress = isCurrent
              ? ((streakCount / milestone.day) * 100).toFixed(0)
              : isUnlocked
                ? 100
                : 0

            return (
              <div
                key={milestone.day}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">{milestone.emoji}</div>
                <div className="achievement-info">
                  <div className="achievement-title">
                    {milestone.title}
                    {isUnlocked && <span className="badge">Unlocked</span>}
                    {isCurrent && <span className="badge current">Current</span>}
                  </div>
                  <div className="achievement-description">{milestone.description}</div>
                  <div className="achievement-requirement">Day {milestone.day}</div>
                  {isCurrent && (
                    <div className="achievement-progress">
                      <div className="achievement-progress-bar">
                        <div
                          className="achievement-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="achievement-progress-text">
                        {streakCount} / {milestone.day} days
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="achievements-footer">
          {unlocked.length} of {ACHIEVEMENT_MILESTONES.length} achievements unlocked
        </div>
      </div>
    </div>
  )
}
