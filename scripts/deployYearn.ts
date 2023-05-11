import hardhat, { ethers } from 'hardhat';

async function deploy() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;
	const deployArgs: [string, number] = [feeReceiver, feeInBasisPoints];

	const YearnProxy = await ethers.getContractFactory('YearnProxy');
	const yearnProxy = await YearnProxy.deploy(...deployArgs);
	await yearnProxy.deployed();
	console.log(yearnProxy.address);

	await new Promise((resolve) => setTimeout(resolve, 30000));

	await hardhat.run('verify:verify', {
		address: yearnProxy.address,
		constructorArguments: deployArgs,
	});
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
