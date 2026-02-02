import { createConnector } from 'wagmi'
import sdk from '@farcaster/miniapp-sdk'

export function farcasterFrame() {
  return createConnector((config) => ({
    id: 'farcasterFrame',
    name: 'Farcaster',
    type: 'farcasterFrame',

    async connect() {
      const provider = await this.getProvider()
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const chainId = await this.getChainId()
      return { accounts, chainId }
    },

    async disconnect() {},

    async getAccounts() {
      const provider = await this.getProvider()
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts
    },

    async getChainId() {
      const provider = await this.getProvider()
      const chainId = await provider.request({ method: 'eth_chainId' })
      return Number(chainId)
    },

    async getProvider() {
      return sdk.wallet.getEthereumProvider()
    },

    async isAuthorized() {
      try {
        const accounts = await this.getAccounts()
        return accounts.length > 0
      } catch {
        return false
      }
    },

    onAccountsChanged(accounts) {
      config.emitter.emit('change', { accounts })
    },

    onChainChanged(chain) {
      config.emitter.emit('change', { chainId: Number(chain) })
    },

    onDisconnect() {
      config.emitter.emit('disconnect')
    },
  }))
}
