import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import {
  DEBUG_WHITELIST,
  getMilestoneByDay,
  getNextMilestone,
} from '../constants'
import { useStreakFull } from '../useStreak'

const COOLDOWN_INCREMENT = 22
const BASE_WIDTH = 240
const STRETCH_EXTRA = 160

export default function PlayScreen() {
  const {
    streakCount,
    setStreakCount,
    onCooldown,
    setOnCooldown,
    isConnected,
    address,
    getTimeUntilReset,
    getStorageKey,
    saveStreak,
  } = useStreakFull()

  const [stretched, setStretched] = useState(false)
  const [fading, setFading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [buttonWidth, setButtonWidth] = useState(BASE_WIDTH)
  const [showExtraS, setShowExtraS] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showCooldown, setShowCooldown] = useState(false)
  const [countdownText, setCountdownText] = useState('')
  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)

  const isDebug = address && DEBUG_WHITELIST.map(a => a.toLowerCase()).includes(address.toLowerCase())

  // Sync button width with streak count and cooldown state
  useEffect(() => {
    setButtonWidth(BASE_WIDTH + (streakCount - 1) * COOLDOWN_INCREMENT)
    if (onCooldown) {
      setShowCooldown(true)
    }
  }, [streakCount, onCooldown])

  // Countdown timer for cooldown display
  useEffect(() => {
    if (onCooldown || showCooldown) {
      const tick = () => {
        const text = getTimeUntilReset()
        if (text) {
          setCountdownText(text)
        } else {
          setOnCooldown(false)
          setShowCooldown(false)
          setTransitioning(false)
          setCountdownText('')
        }
      }
      tick()
      const interval = setInterval(tick, 1000)
      return () => clearInterval(interval)
    }
  }, [onCooldown, showCooldown, getTimeUntilReset, setOnCooldown])

  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => {
      setToast(null)
      toastTimerRef.current = null
    }, 3000)
  }, [])

  // Clean up toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  const handleClick = async () => {
    if (!isConnected || !address || animating || onCooldown) return

    setAnimating(true)
    setStretched(true)
    setShowExtraS(true)

    const newCount = streakCount + 1
    try {
      saveStreak(newCount)
    } catch {
      showToast('Failed to save progress', 'error')
    }

    const milestone = getMilestoneByDay(newCount)
    if (milestone) {
      setTimeout(() => {
        showToast(`${milestone.emoji} ${milestone.title}`, 'achievement')
      }, 500)
    } else {
      showToast('\u2705 Still Basing!', 'success')
    }

    // Fading animation
    setTimeout(() => {
      setFading(true)
    }, 1200)

    // Transition up
    setTimeout(() => {
      setStreakCount(newCount)
      setButtonWidth(BASE_WIDTH + (newCount - 1) * COOLDOWN_INCREMENT)
      setStretched(false)
      setFading(false)
      setShowExtraS(false)
    }, 1950)

    // Show cooldown
    setTimeout(() => {
      setTransitioning(true)
    }, 2500)

    setTimeout(() => {
      setShowCooldown(true)
      setOnCooldown(true)
      setAnimating(false)
    }, 3000)
  }

  const handleDebugReset = () => {
    const key = getStorageKey()
    if (key) {
      localStorage.removeItem(key)
      setStreakCount(1)
      setOnCooldown(false)
      setShowCooldown(false)
      setTransitioning(false)
      setButtonWidth(BASE_WIDTH)
      showToast('Debug: Streak reset to 1', 'success')
    }
  }

  const handleDebugJump = () => {
    saveStreak(7)
    setStreakCount(7)
    setOnCooldown(true)
    setButtonWidth(BASE_WIDTH + 6 * COOLDOWN_INCREMENT)
    showToast('Debug: Jumped to 7 base streaks', 'success')
  }

  const nextMilestone = getNextMilestone(streakCount)

  return (
    <div className="screen-container">
      <div className="container">
        {/* Play stats at top center */}
        <div className="play-stats">
          <div className="play-stat">
            <span className="play-stat-value">{streakCount}</span>
            <span className="play-stat-label">Base Streak</span>
          </div>
          {nextMilestone && (
            <div className="play-stat">
              <span className="play-stat-value">{nextMilestone.day - streakCount}</span>
              <span className="play-stat-label">to {nextMilestone.emoji}</span>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        {/* Hint text */}
        {!isConnected && (
          <p className="hint-text">Connect your wallet to start your streak</p>
        )}
        {isConnected && !onCooldown && (
          <p className="hint-text">Press today to keep your base streak</p>
        )}

        {/* THE BUTTON */}
        <div
          className={`button ${stretched ? 'stretched' : ''} ${transitioning || onCooldown ? 'transitioning' : ''} ${isConnected ? '' : 'disabled'}`}
          onClick={handleClick}
          style={{
            cursor: !isConnected || animating || onCooldown ? 'default' : 'pointer',
            width: stretched ? `${buttonWidth + STRETCH_EXTRA}px` : `${buttonWidth}px`,
            opacity: isConnected ? 1 : 0.5,
          }}
        >
          <div className="text-container">
            <span className="text-part">Still Ba{'s'.repeat(streakCount)}</span>
            <span className="square-space">
              {stretched && (
                <Fragment>
                  <span className={`square-icon ${fading ? 'fading' : ''}`} />
                  {showExtraS && <span className="extra-s">s</span>}
                </Fragment>
              )}
            </span>
            <span className="text-part">ing</span>
          </div>
        </div>

        {/* Cooldown countdown */}
        {(showCooldown || onCooldown) && (
          <div className="cooldown-text-appearing">
            {countdownText && (
              <span className="countdown-small">{countdownText}</span>
            )}
            <p className="hint-text">Come back tomorrow.</p>
          </div>
        )}

        {/* Debug buttons */}
        {isDebug && (
          <div className="debug-buttons">
            <button className="debug-button debug-reset" onClick={handleDebugReset}>
              Reset streak
            </button>
            <button className="debug-button debug-jump" onClick={handleDebugJump}>
              Jump to 7
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
