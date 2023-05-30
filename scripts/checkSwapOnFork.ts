import { ethers } from 'hardhat';
// eslint-disable-next-line camelcase
import { IQuoter, IQuoterV2, ISwapRouter } from '../typechain-types';
import { log } from 'console';
import { abi } from './../node_modules/@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { getPoolImmutables, getPoolState } from '../utils/helpers';
import { parseUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

async function executeSwap() {
	const feeReceiver = '0x037ef1821002d716E3C612beb23DCF4Ef338A405';
	const feeInBasisPoints = 100;
	const universalRouter = '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B';
	const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
	const deployArgs: [string, string, string, number] = [universalRouter, weth, feeReceiver, feeInBasisPoints];

	// eslint-disable-next-line camelcase
	// const SwapProxy = (await ethers.getContractFactory('SwapProxy')) as SwapProxy__factory;
	// const swapProxy = await SwapProxy.deploy(...deployArgs);
	// await swapProxy.deployed();

	// log('SwapProxy', swapProxy.address);

	const router = (await ethers.getContractAt('ISwapRouter', universalRouter)) as ISwapRouter;

	log('SwapRouter', router.address);

	const poolAddress = '0x4e68Ccd3E89f51C3074ca5072bbAC773960dFa36';
	const pool = new ethers.Contract(poolAddress, abi, ethers.provider);

	const quoterAddress = '0x61fFE014bA17989E743c5F6cB21bF9697530B21e';
	const quoter = (await ethers.getContractAt('IQuoterV2', quoterAddress)) as IQuoterV2;

	const { token0, token1, fee } = await getPoolImmutables(pool);

	const { sqrtPriceX96 } = await getPoolState(pool);
	console.log('sqrtPriceX96', sqrtPriceX96.toString());

	const decimals0 = 18;
	const amountIn = parseUnits('0.005', decimals0);

	// const decimals1 = 6;
	const quoteParams: IQuoterV2.QuoteExactInputSingleParamsStruct = {
		tokenIn: token0,
		tokenOut: token1,
		fee,
		amountIn,
		sqrtPriceLimitX96: BigNumber.from(0),
	};

	console.log('Quote params', quoteParams);

	const quoteResult = await quoter.callStatic.quoteExactInputSingle(quoteParams);
	console.log('QuoteResult', quoteResult);

	const signers = await ethers.getSigners();
	const deadline = Math.floor(new Date().getTime() / 1000) + 60 * 10;

	const params: ISwapRouter.ExactInputSingleParamsStruct = {
		tokenIn: token0,
		tokenOut: token1,
		fee,
		recipient: signers[0].address,
		amountIn,
		amountOutMinimum: quoteResult.amountOut,
		deadline,
		sqrtPriceLimitX96: sqrtPriceX96,
	};

	console.log(params);

	const tx = await router.exactInputSingle(params);

	// console.log(tx);

	// const address = '0x3797669a4616cdABd9F807a4E637DdB538C98345';

	// const tx = await router.execute(
	// 	weth,
	// 	swapEthToUSDT.value,
	// 	swapEthToUSDT.commands,
	// 	swapEthToUSDT.inputs,
	// 	swapEthToUSDT.deadline,
	// );
}

executeSwap()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
