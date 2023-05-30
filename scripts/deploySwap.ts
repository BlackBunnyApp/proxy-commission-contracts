import hardhat, { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { SwapProxy__factory } from '../typechain-types';

async function deploy() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;

	const permit = '0x000000000022d473030f116ddee9f6b43ac78ba3';
	const universalRouter = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5';

	const deployArgs: [string, string, string, number] = [universalRouter, permit, feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	const SwapProxy = (await ethers.getContractFactory('SwapProxy')) as SwapProxy__factory;
	const swapProxy = await SwapProxy.deploy(...deployArgs);
	await swapProxy.deployed();
	// const address = '0x3797669a4616cdABd9F807a4E637DdB538C98345';
	console.log(swapProxy.address);

	await new Promise((resolve) => setTimeout(resolve, 30000));
	await hardhat.run('verify:verify', {
		address: swapProxy.address,
		constructorArguments: deployArgs,
	});
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
