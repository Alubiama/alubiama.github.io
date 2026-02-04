import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount } from 'wagmi'
import { STREAK_KEY_PREFIX } from './constants'

const COOLDOWN_MS = 24 * 60 * 60 * 1000   // 24 hours
const STREAK_BREAK_MS = 48 * 60 * 60 * 1000 // 48 hours — streak resets
const LONGEST_KEY_PREFIX = 'stillbasing_longest_'

/**
 * Shared hook for reading streak data from localStorage.
 * Used by StatsScreen, AchievementsScreen, NftScreen (read-only consumers).
 */
export function useStreakData() {
  const { address } = useAccount()
  const [streakCount, setStreakCount] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)

  useEffect(() => {
    if (!address) {
      setStreakCount(0)
      setLongestStreak(0)
      return
    }
    const key = STREAK_KEY_PREFIX + address.toLowerCase()
    const longestKey = LONGEST_KEY_PREFIX + address.toLowerCase()
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        setStreakCount(data.streakCount || 0)
      } else {
        setStreakCount(0)
      }

      const longest = parseInt(localStorage.getItem(longestKey) || '0', 10)
      setLongestStreak(longest)
    } catch (err) {
      console.error('Failed to parse streak data:', err)
    }
  }, [address])

  return { streakCount, longestStreak, address }
}

/**
 * Full streak hook with cooldown logic, press handling, and save.
 * Used by PlayScreen.
 */
export function useStreakFull() {
  const { isConnected, address } = useAccount()
  const [streakCount, setStreakCount] = useState(1)
  const [onCooldown, setOnCooldown] = useState(false)
  const lastPressRef = useRef(0)

  const getStorageKey = useCallback(() => {
    if (!address) return null
    return STREAK_KEY_PREFIX + address.toLowerCase()
  }, [address])

  const getLongestKey = useCallback(() => {
    if (!address) return null
    return LONGEST_KEY_PREFIX + address.toLowerCase()
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

  const loadStreak = useCallback(() => {
    const key = getStorageKey()
    if (!key) return
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        const now = Date.now()
        const lastPress = data.lastPressTime || 0
        const elapsed = now - lastPress

        lastPressRef.current = lastPress

        if (lastPress && elapsed < COOLDOWN_MS) {
          setStreakCount(data.streakCount)
          setOnCooldown(true)
        } else if (lastPress && elapsed < STREAK_BREAK_MS) {
          setStreakCount(data.streakCount)
          setOnCooldown(false)
        } else {
          setStreakCount(1)
          setOnCooldown(false)
        }
      }
    } catch (err) {
      console.error('Failed to load streak:', err)
    }
  }, [getStorageKey])

  const saveStreak = useCallback((newCount) => {
    const key = getStorageKey()
    const longestKey = getLongestKey()
    if (!key || !longestKey) return
    try {
      const now = Date.now()
      lastPressRef.current = now
      localStorage.setItem(key, JSON.stringify({ lastPressTime: now, streakCount: newCount }))
      const longest = parseInt(localStorage.getItem(longestKey) || '0', 10)
      if (newCount > longest) {
        localStorage.setItem(longestKey, newCount.toString())
      }
    } catch (err) {
      console.error('Failed to save streak:', err)
      throw err
    }
  }, [getStorageKey, getLongestKey])

  useEffect(() => {
    if (address) {
      loadStreak()
    } else {
      setStreakCount(1)
      setOnCooldown(false)
    }
  }, [address, loadStreak])

  return {
    streakCount,
    setStreakCount,
    onCooldown,
    setOnCooldown,
    isConnected,
    address,
    lastPressRef,
    getTimeUntilReset,
    getStorageKey,
    saveStreak,
    loadStreak,
    COOLDOWN_MS,
  }
}
