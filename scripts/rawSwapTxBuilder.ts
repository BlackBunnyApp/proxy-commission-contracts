import { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { log } from 'console';
// eslint-disable-next-line camelcase
import { SwapProxy__factory } from '../typechain-types';
import { Percent, TradeType } from '@uniswap/sdk-core';
import { Trade as V2TradeSDK } from '@uniswap/v2-sdk';
import { Trade as V3TradeSDK } from '@uniswap/v3-sdk';
import { MixedRouteTrade, MixedRouteSDK, Trade as RouterTrade } from '@uniswap/router-sdk';
import { SwapOptions, SwapRouter, UniswapTrade } from '@uniswap/universal-router-sdk';

async function deploy() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;
	const weth = '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619';
	const universalRouter = '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5';
	const deployArgs: [string, string, string, number] = [universalRouter, weth, feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	const SwapProxy = (await ethers.getContractFactory('SwapProxy')) as SwapProxy__factory;
	const swapProxy = await SwapProxy.deploy(...deployArgs);
	await swapProxy.deployed();
	// const address = '0x3797669a4616cdABd9F807a4E637DdB538C98345';
	console.log(swapProxy.address);

	// const slippageTolerance: Percent = new Percent(1);
	// const recipient = feeReceiver;

	// const options: SwapOptions = { slippageTolerance, recipient }

	// const routerTrade = new UniswapTrade(
	// 	new RouterTrade({ v2Routes, v3Routes, mixedRoutes, tradeType: TradeType.EXACT_INPUT }
	// 	);
	// Use the raw calldata and value returned to call into Universal Swap Router contracts
	// const { calldata, value } = SwapRouter.swapCallParameters(routerTrade);

	const tx = await swapProxy.populateTransaction.executePlain(
		weth,
		'1000000000000000000',
		'0x0b00',
		[
			'0x00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a7640000',
			// eslint-disable-next-line max-len
			'0x00000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000de1f100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f4c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000',
		],
		Math.floor(new Date().getTime() / 1000) + 1000,
	);

	log(tx);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
