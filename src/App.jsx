import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import { ConnectWallet } from '@coinbase/onchainkit/wallet'
import PlayScreen from './screens/PlayScreen'
import StatsScreen from './screens/StatsScreen'
import AchievementsScreen from './screens/AchievementsScreen'
import NftScreen from './screens/NftScreen'

export default function App() {
  const { isConnected } = useAccount()
  const { setFrameReady, isFrameReady } = useMiniKit()

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem('onboarding_completed')
  )
  const [darkMode, setDarkMode] = useState(
    () =>
      localStorage.getItem('dark_mode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  const [activeTab, setActiveTab] = useState('play')

  // Signal frame readiness via MiniKit
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [setFrameReady, isFrameReady])

  // Dark mode persistence
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
    localStorage.setItem('dark_mode', darkMode)
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode(prev => !prev)

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'play':
        return <PlayScreen />
      case 'stats':
        return <StatsScreen />
      case 'achievements':
        return <AchievementsScreen />
      case 'nft':
        return <NftScreen />
      default:
        return <PlayScreen />
    }
  }

  return (
    <div className="app">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <h1>Still Basing</h1>
            <div className="onboarding-content">
              <p className="intro">
                A daily habit tracker on Base blockchain. Press once a day to grow your streak!
              </p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">{"\u{1F535}"}</span>
                  <div>
                    <h3>Daily Press</h3>
                    <p>Press the button once a day to maintain your streak</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">{"\u{1F525}"}</span>
                  <div>
                    <h3>Grow Your Streak</h3>
                    <p>Build consecutive days to unlock achievements</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">{"\u{1F3C6}"}</span>
                  <div>
                    <h3>Collect NFTs</h3>
                    <p>Reach milestones and claim unique NFTs on Zora</p>
                  </div>
                </div>
              </div>
              <div className="onboarding-note">
                <strong>How it works:</strong> Connect wallet {"\u2192"} Press daily {"\u2192"} Reach milestones {"\u2192"} Collect NFTs on the NFT tab
              </div>
            </div>
            <button className="onboarding-button" onClick={completeOnboarding}>
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Wallet & Theme Section */}
      <div className="wallet-section">
        <button
          className="theme-toggle"
          onClick={toggleDarkMode}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '\u2600\uFE0F' : '\u{1F319}'}
        </button>
        <ConnectWallet />
      </div>

      {/* Active Screen */}
      {renderScreen()}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'play' ? 'active' : ''}`}
          onClick={() => setActiveTab('play')}
        >
          <span className="nav-icon">{"\u{1F535}"}</span>
          Play
        </button>
        <button
          className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="nav-icon">{"\u{1F4CA}"}</span>
          Stats
        </button>
        <button
          className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveTab('achievements')}
        >
          <span className="nav-icon">{"\u{1F3C6}"}</span>
          Awards
        </button>
        <button
          className={`nav-item ${activeTab === 'nft' ? 'active' : ''}`}
          onClick={() => setActiveTab('nft')}
        >
          <span className="nav-icon">{"\u{1F5BC}\uFE0F"}</span>
          NFT
        </button>
      </nav>
    </div>
  )
}
