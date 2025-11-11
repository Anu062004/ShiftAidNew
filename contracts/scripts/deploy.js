const hre = require('hardhat');

async function main() {
  console.log('Deploying DonationRouter contract...');
  console.log('Network:', hre.network.name);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'MATIC');

  if (balance === 0n) {
    console.error('❌ Error: Account has no MATIC. Please fund your wallet.');
    console.log('Get testnet MATIC from: https://faucet.polygon.technology/');
    process.exit(1);
  }

  // Deploy contract
  const DonationRouter = await hre.ethers.getContractFactory('DonationRouter', deployer);
  console.log('Deploying contract...');
  
  const donationRouter = await DonationRouter.deploy();
  await donationRouter.waitForDeployment();

  const address = await donationRouter.getAddress();
  console.log('✅ DonationRouter deployed to:', address);
  console.log('📝 Save this address in your .env file as CONTRACT_ADDRESS');
  console.log('');
  console.log('Backend (.env):');
  console.log(`CONTRACT_ADDRESS=${address}`);
  console.log('');
  console.log('Frontend (.env.local):');
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  // Verify contract on block explorer (optional)
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    console.log('');
    console.log('Waiting for block confirmations...');
    const deploymentTx = donationRouter.deploymentTransaction();
    if (deploymentTx) {
      await deploymentTx.wait(5);

      try {
        console.log('Verifying contract on block explorer...');
        await hre.run('verify:verify', {
          address: address,
          constructorArguments: [],
        });
        console.log('✅ Contract verified on block explorer');
      } catch (error) {
        console.log('⚠️  Contract verification failed:', error.message);
        console.log('You can verify manually later using:');
        console.log(`npx hardhat verify --network ${hre.network.name} ${address}`);
      }
    }

    // Show block explorer link
    if (hre.network.name === 'polygon-amoy') {
      console.log('');
      console.log('View on Polygonscan:');
      console.log(`https://amoy.polygonscan.com/address/${address}`);
    } else if (hre.network.name === 'polygon') {
      console.log('');
      console.log('View on Polygonscan:');
      console.log(`https://polygonscan.com/address/${address}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Deployment failed:');
    console.error(error);
    if (error.message.includes('insufficient funds')) {
      console.log('');
      console.log('💡 Get testnet MATIC from: https://faucet.polygon.technology/');
    }
    process.exit(1);
  });


