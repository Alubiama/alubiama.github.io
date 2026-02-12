import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import {
  getTodayQuest,
  isTodayQuestCompleted,
  markQuestCompleted,
  getTotalQuestPoints,
  getQuestCompletionCount,
} from '../quests'

export default function QuestScreen() {
  const { address, isConnected } = useAccount()
  const [quest, setQuest] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [totalPoints, setTotalPoints] = useState(0)
  const [questCount, setQuestCount] = useState(0)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    setQuest(getTodayQuest())
  }, [])

  useEffect(() => {
    if (address) {
      setCompleted(isTodayQuestCompleted(address))
      setTotalPoints(getTotalQuestPoints(address))
      setQuestCount(getQuestCompletionCount(address))
    }
  }, [address])

  const handleStartQuest = () => {
    if (!quest?.url) return
    window.open(quest.url, '_blank', 'noopener,noreferrer')
    setShowConfirm(true)
  }

  const handleConfirmComplete = () => {
    if (!address || !quest) return
    markQuestCompleted(address, quest.id)
    setCompleted(true)
    setTotalPoints(getTotalQuestPoints(address))
    setQuestCount(getQuestCompletionCount(address))
    setShowConfirm(false)
  }

  if (!isConnected) {
    return (
      <div className="screen-container">
        <div className="empty-state">
          <span className="empty-icon">{"\u{1F517}"}</span>
          <h2>Connect Wallet</h2>
          <p>Connect your wallet to access daily quests</p>
        </div>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="screen-container">
        <div className="quest-loading">Loading quest...</div>
      </div>
    )
  }

  return (
    <div className="screen-container quest-screen">
      <div className="quest-content">
        <h1 className="screen-title">Daily Quest</h1>
        <p className="screen-subtitle">Learn Base, earn points</p>

        {/* Stats */}
        <div className="quest-stats">
          <div className="quest-stat">
            <span className="quest-stat-value">{totalPoints}</span>
            <span className="quest-stat-label">Points</span>
          </div>
          <div className="quest-stat">
            <span className="quest-stat-value">{questCount}</span>
            <span className="quest-stat-label">Quests Done</span>
          </div>
        </div>

        {/* Quest Card */}
        <div className={`quest-card ${completed ? 'completed' : ''}`}>
          <div className="quest-emoji">{quest.emoji}</div>
          <h2 className="quest-title">{quest.title}</h2>
          <p className="quest-description">{quest.description}</p>
          <p className="quest-points">+{quest.points} points</p>

          {quest.learnMore && (
            <p className="quest-learn">{quest.learnMore}</p>
          )}

          {completed ? (
            <div className="quest-completed-badge">
              {"\u2705"} Completed today!
            </div>
          ) : showConfirm ? (
            <div className="quest-confirm">
              <p>Did you complete the quest?</p>
              <div className="quest-confirm-buttons">
                <button
                  className="quest-button quest-button-yes"
                  onClick={handleConfirmComplete}
                >
                  Yes, done!
                </button>
                <button
                  className="quest-button quest-button-no"
                  onClick={() => setShowConfirm(false)}
                >
                  Not yet
                </button>
              </div>
            </div>
          ) : (
            <button
              className="quest-button quest-button-start"
              onClick={handleStartQuest}
            >
              Start Quest {"\u2192"}
            </button>
          )}
        </div>

        {/* Info */}
        <p className="quest-info">
          New quest every day. GM button still tracks your streak!
        </p>
      </div>
    </div>
  )
}
