import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { assertRoughlyEqualValues } from '../../src';
import { ERC20, SwapProxy, UniswapV2Router02 } from '../../typechain-types';
import { getSignerFromEnvPrivate } from '../../utils/getSignerFromEnvPrivate';

describe('swapTokensForExactTokens', async function () {
	const usdc = '0xd7067E6AcC2B703df74b7c83464c4dfB2Ee27d43';
	const eth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
	const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
	const sushi = '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2';

	const pathDaiToSushi = [dai, sushi];
	const deadline = Math.floor(new Date().getTime() / 1000) + 120;

	const commissionReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const commissionAmountIsBasisPoints = 100; // 1%

	async function deploySwapProxy(): Promise<UniswapV2Router02> {
		const sushiSwap = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

		const SwapProxy = await ethers.getContractFactory('SwapProxy');
		const swapProxy = (await SwapProxy.deploy(
			sushiSwap,
			commissionReceiver,
			commissionAmountIsBasisPoints,
		)) as unknown as SwapProxy;
		// await swapProxy.setImplementation(sushiSwap);

		return swapProxy as unknown as UniswapV2Router02;
	}

	xit('Try proxy call', async function () {
		const swapProxy = await loadFixture(deploySwapProxy);
		await swapProxy.WETH();
		const tx = await swapProxy.populateTransaction.factory();
		console.log(tx);
	});

	it('Swap happens and commission taken', async function () {
		const amountInMax = BigNumber.from('10000000000000000');
		const amountOut = BigNumber.from('8119599574477165');

		const Dai = await ethers.getContractFactory('ERC20');
		const daiContract = Dai.attach(dai) as ERC20;
		const signer = await getSignerFromEnvPrivate();

		const swapProxy = await loadFixture(deploySwapProxy);

		const approve = await daiContract.connect(signer).approve(swapProxy.address, amountInMax);
		await approve.wait();

		// console.log('Allowance', formatEther(await daiContract.allowance(signer.address, swapProxy.address)));

		const tx = await swapProxy
			.connect(signer)
			.swapTokensForExactTokens(amountOut, amountInMax, pathDaiToSushi, signer.address, deadline);
		const receipt = await tx.wait();

		const event = receipt.events?.find((event) => event.event === 'SwapWithCommission');
		// console.log(event);
		const commission = (event as any).args[4];

		assertRoughlyEqualValues(commission.toString(), amountInMax.mul(100).div(10000).toString(), 100);

		expect(receipt.status).to.be.eq(1);
	});
});
