import hardhat, { ethers } from 'hardhat';

async function deploy() {
	const commissionReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const commissionInBasisPoints = 100;
	const sushiRouter = '0xEfF92A263d31888d860bD50809A8D171709b7b1c';
	const deployArgs: [string, string, number] = [sushiRouter, commissionReceiver, commissionInBasisPoints];

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
