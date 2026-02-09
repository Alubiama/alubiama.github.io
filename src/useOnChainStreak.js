import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { STREAK_CONTRACT, STREAK_TRACKER_ABI } from './constants'

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

/**
 * Hook for on-chain streak tracking
 * @param {string} address - User's wallet address
 */
export function useOnChainStreak(address) {
  const isContractDeployed = STREAK_CONTRACT !== ZERO_ADDRESS

  // Read on-chain status
  const { data: statusData, refetch: refetchStatus } = useReadContract({
    address: STREAK_CONTRACT,
    abi: STREAK_TRACKER_ABI,
    functionName: 'getStatus',
    args: [address],
    query: {
      enabled: isContractDeployed && !!address,
    },
  })

  // Write check-in transaction
  const { writeContract, data: txHash, isPending: isWritePending } = useWriteContract()

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Parse status data
  const onChainStatus = statusData ? {
    currentStreak: Number(statusData[0]),
    longestStreak: Number(statusData[1]),
    lastCheckIn: Number(statusData[2]),
    totalCheckIns: Number(statusData[3]),
    canCheckIn: statusData[4],
    timeUntilCheckIn: Number(statusData[5]),
  } : null

  // Check-in function
  const checkInOnChain = () => {
    if (!isContractDeployed) {
      console.warn('Contract not deployed yet')
      return
    }
    writeContract({
      address: STREAK_CONTRACT,
      abi: STREAK_TRACKER_ABI,
      functionName: 'checkIn',
    })
  }

  return {
    isContractDeployed,
    onChainStatus,
    checkInOnChain,
    isCheckingIn: isWritePending || isConfirming,
    isConfirmed,
    txHash,
    refetchStatus,
  }
}
