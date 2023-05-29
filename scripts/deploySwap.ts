import hardhat, { ethers } from 'hardhat';

async function deploy() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;
	const weth = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
	const universalRouter = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5';
	const deployArgs: [string, string, string, number] = [universalRouter, weth, feeReceiver, feeInBasisPoints];

	const SwapProxy = await ethers.getContractFactory('SwapProxy');
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
