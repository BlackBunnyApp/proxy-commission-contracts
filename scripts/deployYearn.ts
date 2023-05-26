import hardhat, { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { YearnProxy__factory } from '../typechain-types';
import { log } from 'console';

async function deploy() {
	// production build
	const feeReceiver = '0xd9FaE4121A72008ded7C42816982d6ABD44F0421'; // Gnosis from owner
	const feeInBasisPoints = 50;
	const deployArgs: [string, number] = [feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	const YearnProxy = (await ethers.getContractFactory('YearnProxy')) as YearnProxy__factory;
	const yearnProxy = await YearnProxy.deploy(...deployArgs);
	// const yearnProxy = { address: '0x3797669a4616cdABd9F807a4E637DdB538C98345' };
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
