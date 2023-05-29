import { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { log } from 'console';
// eslint-disable-next-line camelcase
import { YearnProxy__factory } from '../typechain-types';

async function deploy() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;

	const vault = '0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE';
	const amount = '10000000';

	const deployArgs: [string, number] = [feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	const YearnProxy = (await ethers.getContractFactory('YearnProxy')) as YearnProxy__factory;
	const yearnProxy = await YearnProxy.deploy(...deployArgs);
	await yearnProxy.deployed();
	// const address = '0x3797669a4616cdABd9F807a4E637DdB538C98345';
	console.log(yearnProxy.address);

	const tx = await yearnProxy.populateTransaction.deposit(vault, amount);

	log(tx);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
