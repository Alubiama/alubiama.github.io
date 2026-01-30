import React from 'react'
import ReactDOM from 'react-dom/client'
import { MiniKitProvider } from '@coinbase/onchainkit/minikit'
import { base } from 'wagmi/chains'
import '@coinbase/onchainkit/styles.css'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MiniKitProvider
      apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API_KEY}
      chain={base}
      config={{
        appearance: {
          mode: 'auto',
          theme: 'default',
          name: 'Still Basing',
          logo: 'https://alubiama.github.io/icon-192.png',
        },
      }}
    >
      <App />
    </MiniKitProvider>
  </React.StrictMode>
)
