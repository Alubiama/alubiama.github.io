import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount } from 'wagmi'
import {
  STREAK_KEY_PREFIX,
  STREAK_KEY,
  DEBUG_WHITELIST,
  getBasingLevel,
  getTodayString,
  dayDiff,
  getNextMilestone,
  getMilestoneByDay,
} from '../constants'

const COOLDOWN_INCREMENT = 5 // seconds added per streak day

export default function PlayScreen() {
  const { isConnected, address } = useAccount()

  const [clickedToday, setClickedToday] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [debugMode, setDebugMode] = useState(false)
  const [streakCount, setStreakCount] = useState(1)
  const [cooldownTotal, setCooldownTotal] = useState(240)
  const [timeLeft, setTimeLeft] = useState(0)
  const [toast, setToast] = useState(null)
  const intervalRef = useRef(null)

  const getStorageKey = useCallback(() => {
    if (!address) return null
    return STREAK_KEY_PREFIX + address.toLowerCase()
  }, [address])

  // Debug mode for whitelisted wallets
  useEffect(() => {
    if (address && DEBUG_WHITELIST.map(a => a.toLowerCase()).includes(address.toLowerCase())) {
      setDebugMode(true)
    } else {
      setDebugMode(false)
    }
  }, [address])

  // Load streak from localStorage
  const loadStreak = useCallback(() => {
    const key = getStorageKey()
    if (key) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          const today = getTodayString()
          const lastDay = data.lastStreakDay
          if (lastDay === today) {
            setStreakCount(data.streakCount)
            setClickedToday(true)
            setCooldownTotal(240 + (data.streakCount - 1) * COOLDOWN_INCREMENT)
          } else if (dayDiff(lastDay, today) === 1) {
            setStreakCount(data.streakCount)
            setClickedToday(false)
            setCooldownTotal(240 + (data.streakCount - 1) * COOLDOWN_INCREMENT)
          } else {
            // Streak broken
            setStreakCount(1)
            setClickedToday(false)
            setCooldownTotal(240)
          }
        }
      } catch (err) {
        console.error('Failed to load streak:', err)
      }
    }
  }, [getStorageKey])

  useEffect(() => {
    if (isConnected) {
      loadStreak()
    } else {
      setStreakCount(1)
      setClickedToday(false)
      setCooldownTotal(240)
    }
  }, [isConnected, loadStreak])

  // Cooldown timer
  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(intervalRef.current)
    }
  }, [timeLeft])

  const saveStreak = (newCount) => {
    const key = getStorageKey()
    if (key) {
      try {
        const data = { lastStreakDay: getTodayString(), streakCount: newCount }
        localStorage.setItem(key, JSON.stringify(data))

        // Also save to legacy key for stats screens
        localStorage.setItem(STREAK_KEY, JSON.stringify(data))

        // Track longest
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

  const handleClick = () => {
    if (clickedToday && !debugMode) return
    if (timeLeft > 0 && !debugMode) return

    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    const today = getTodayString()
    const key = getStorageKey()
    let newCount = streakCount

    if (key) {
      try {
        const raw = localStorage.getItem(key)
        if (raw) {
          const data = JSON.parse(raw)
          const lastDay = data.lastStreakDay
          if (lastDay === today) {
            // Already clicked today
            if (!debugMode) return
            newCount = data.streakCount
          } else if (dayDiff(lastDay, today) === 1) {
            newCount = data.streakCount + 1
          } else {
            newCount = 1
          }
        } else {
          newCount = 1
        }
      } catch {
        newCount = 1
      }
    }

    setStreakCount(newCount)
    setClickedToday(true)
    saveStreak(newCount)

    const newCooldown = 240 + (newCount - 1) * COOLDOWN_INCREMENT
    setCooldownTotal(newCooldown)
    setTimeLeft(newCooldown)

    // Check milestone
    const milestone = getMilestoneByDay(newCount)
    if (milestone) {
      showToast(`${milestone.emoji} ${milestone.title} - ${milestone.description}`)
    } else {
      showToast(`Day ${newCount}! ${getBasingLevel(newCount)}`)
    }
  }

  // Debug: jump to streak day 7
  const handleDebugJump = () => {
    if (!debugMode) return
    const newCount = 7
    setStreakCount(newCount)
    setClickedToday(true)
    saveStreak(newCount)
    setCooldownTotal(240 + (newCount - 1) * COOLDOWN_INCREMENT)
    showToast(`Debug: Jumped to day ${newCount}`)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const nextMilestone = getNextMilestone(streakCount)
  const progress = nextMilestone
    ? ((streakCount / nextMilestone.day) * 100).toFixed(0)
    : 100

  return (
    <div className="screen-container play-screen">
      <div className="play-content">
        <h1 className="basing-text">{getBasingLevel(streakCount)}</h1>

        <div className="streak-display">
          <span className="streak-number">{streakCount}</span>
          <span className="streak-label">day streak</span>
        </div>

        {nextMilestone && (
          <div className="milestone-progress">
            <div className="progress-header">
              <span>Next: {nextMilestone.emoji} {nextMilestone.title}</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-subtitle">
              {nextMilestone.day - streakCount} base streaks to next achievement
            </span>
          </div>
        )}

        <button
          className={`click-button ${animating ? 'animating' : ''} ${clickedToday ? 'clicked' : ''}`}
          onClick={handleClick}
          disabled={(clickedToday || timeLeft > 0) && !debugMode}
        >
          {clickedToday
            ? timeLeft > 0
              ? formatTime(timeLeft)
              : '\u2705 Based today!'
            : isConnected
              ? 'STILL BASING'
              : 'Connect wallet to play'}
        </button>

        {toast && (
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        )}

        {debugMode && (
          <div className="debug-panel">
            <p>Debug Mode</p>
            <button className="debug-button" onClick={handleDebugJump}>
              Jump to 7
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
