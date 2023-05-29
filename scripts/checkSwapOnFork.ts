import hardhat, { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { IUniversalRouter, SwapProxy__factory } from '../typechain-types';
import { log } from 'console';

async function deploy() {
	// hardhat.tracer.enabled = true;
	const swapEthToUSDT = {
		commands: '0x0b00',
		value: '5000000000000000',
		inputs: [
			'0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000011c37937e08000',
			// eslint-disable-next-line max-len
			'0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000011c37937e0800000000000000000000000000000000000000000000000000000000000008c72f600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4dac17f958d2ee523a2206206994597c13d831ec7000000000000000000000000000000000000000000',
		],
		deadline: Math.floor(new Date().getTime() / 1000),
	};

	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;
	const universalRouter = '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B';
	const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
	const deployArgs: [string, string, string, number] = [universalRouter, weth, feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	const SwapProxy = (await ethers.getContractFactory('SwapProxy')) as SwapProxy__factory;
	const swapProxy = await SwapProxy.deploy(...deployArgs);
	await swapProxy.deployed();

	log(swapProxy.address);

	const router = (await ethers.getContractAt('IUniversalRouter', universalRouter)) as IUniversalRouter;

	log(router.address);

	// const address = '0x3797669a4616cdABd9F807a4E637DdB538C98345';

	const tx = await router.execute(swapEthToUSDT.commands, swapEthToUSDT.inputs, swapEthToUSDT.deadline);

	// const tx = await router.execute(
	// 	weth,
	// 	swapEthToUSDT.value,
	// 	swapEthToUSDT.commands,
	// 	swapEthToUSDT.inputs,
	// 	swapEthToUSDT.deadline,
	// );
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
