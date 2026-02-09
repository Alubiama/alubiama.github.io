const hre = require('hardhat')

async function main() {
  console.log('Deploying StreakTracker to', hre.network.name, '...')

  const StreakTracker = await hre.ethers.getContractFactory('StreakTracker')
  const streakTracker = await StreakTracker.deploy()
  await streakTracker.waitForDeployment()

  const address = await streakTracker.getAddress()
  console.log('StreakTracker deployed to:', address)

  // Wait for block confirmations before verifying
  console.log('Waiting for block confirmations...')
  await streakTracker.deploymentTransaction().wait(5)

  // Verify on Basescan
  if (hre.network.name === 'base' || hre.network.name === 'baseSepolia') {
    console.log('Verifying contract on Basescan...')
    try {
      await hre.run('verify:verify', {
        address: address,
        constructorArguments: [],
      })
      console.log('Contract verified!')
    } catch (error) {
      console.log('Verification failed:', error.message)
    }
  }

  return address
}

main()
  .then((address) => {
    console.log('\n✅ Deployment complete!')
    console.log('Contract address:', address)
    console.log('\nNext steps:')
    console.log('1. Add this address to src/constants.js as STREAK_CONTRACT')
    console.log('2. Update the frontend to use the contract')
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
