import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { useAccount } from 'wagmi'
import {
  STREAK_KEY_PREFIX,
  DEBUG_WHITELIST,
  getMilestoneByDay,
  getNextMilestone,
} from '../constants'

const COOLDOWN_INCREMENT = 22
const BASE_WIDTH = 240
const STRETCH_EXTRA = 160
const COOLDOWN_MS = 24 * 60 * 60 * 1000   // 24 hours
const STREAK_BREAK_MS = 48 * 60 * 60 * 1000 // 48 hours — streak resets

export default function PlayScreen() {
  const { isConnected, address } = useAccount()

  const [stretched, setStretched] = useState(false)
  const [fading, setFading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [streakCount, setStreakCount] = useState(1)
  const [buttonWidth, setButtonWidth] = useState(BASE_WIDTH)
  const [showExtraS, setShowExtraS] = useState(false)
  const [onCooldown, setOnCooldown] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const [showCooldown, setShowCooldown] = useState(false)
  const [countdownText, setCountdownText] = useState('')
  const [toast, setToast] = useState(null)
  const lastPressRef = useRef(0)

  const isDebug = address && DEBUG_WHITELIST.map(a => a.toLowerCase()).includes(address.toLowerCase())

  const getStorageKey = useCallback(() => {
    if (!address) return null
    return STREAK_KEY_PREFIX + address.toLowerCase()
  }, [address])

  const getTimeUntilReset = useCallback(() => {
    const now = Date.now()
    const unlockAt = lastPressRef.current + COOLDOWN_MS
    const diff = unlockAt - now
    if (diff <= 0) return null
    const h = Math.floor(diff / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }, [])

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
  }, [onCooldown, showCooldown, getTimeUntilReset])

  // Load streak on mount / address change
  useEffect(() => {
    if (address) {
      loadStreak()
    } else {
      setStreakCount(1)
      setOnCooldown(false)
      setButtonWidth(BASE_WIDTH)
    }
  }, [address])

  const loadStreak = () => {
    const key = getStorageKey()
    if (key) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          const now = Date.now()
          const lastPress = data.lastPressTime || 0
          const elapsed = now - lastPress

          lastPressRef.current = lastPress

          if (lastPress && elapsed < COOLDOWN_MS) {
            // Still on cooldown
            setStreakCount(data.streakCount)
            setOnCooldown(true)
            setShowCooldown(true)
            setButtonWidth(BASE_WIDTH + (data.streakCount - 1) * COOLDOWN_INCREMENT)
          } else if (lastPress && elapsed < STREAK_BREAK_MS) {
            // Cooldown passed, streak alive — can press again
            setStreakCount(data.streakCount)
            setOnCooldown(false)
            setButtonWidth(BASE_WIDTH + (data.streakCount - 1) * COOLDOWN_INCREMENT)
          } else {
            // Streak broken (>48h or no data)
            setStreakCount(1)
            setOnCooldown(false)
            setButtonWidth(BASE_WIDTH)
          }
        }
      } catch (err) {
        console.error('Failed to load streak:', err)
      }
    }
  }

  const saveStreak = (newCount) => {
    const key = getStorageKey()
    if (key) {
      try {
        const now = Date.now()
        const data = { lastPressTime: now, streakCount: newCount }
        lastPressRef.current = now
        localStorage.setItem(key, JSON.stringify(data))
        const longest = parseInt(localStorage.getItem('stillbasing_longest') || '0', 10)
        if (newCount > longest) {
          localStorage.setItem('stillbasing_longest', newCount.toString())
        }
      } catch (err) {
        console.error('Failed to save streak:', err)
        showToast('Failed to save progress', 'error')
      }
    }
  }

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleClick = async () => {
    if (!isConnected || !address || animating || onCooldown) return

    setAnimating(true)
    setStretched(true)
    setShowExtraS(true)

    const newCount = streakCount + 1
    saveStreak(newCount)

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
