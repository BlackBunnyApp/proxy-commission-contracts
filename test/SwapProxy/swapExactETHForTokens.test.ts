import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { assertRoughlyEqualValues } from '../../src';
import { ERC20, SwapProxy } from '../../typechain-types';
import { getSignerFromEnvPrivate } from '../../utils/getSignerFromEnvPrivate';

describe('swapExactETHForTokens', async function () {
	const eth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
	const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

	const amountIn = BigNumber.from('10000000000000000');
	const amountOut = BigNumber.from('17445986289005546602');
	const path = [eth, dai];
	const deadline = Math.floor(new Date().getTime() / 1000) + 120;

	const commissionReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const commissionAmountIsBasisPoints = 100; // 1%

	async function deploySwapProxy(): Promise<SwapProxy> {
		const sushiSwap = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

		const SwapProxy = await ethers.getContractFactory('SwapProxy');
		const swapProxy = (await SwapProxy.deploy(
			sushiSwap,
			commissionReceiver,
			commissionAmountIsBasisPoints,
		)) as SwapProxy;
		return swapProxy;
	}

	it('Swap happens and commission taken', async function () {
		const signer = await getSignerFromEnvPrivate();

		const swapProxy = await loadFixture(deploySwapProxy);

		const tx = await swapProxy.connect(signer).swapExactETHForTokens(amountOut, path, signer.address, deadline, {
			value: amountIn,
		});
		const receipt = await tx.wait();
		// console.log(receipt.events);

		const event = receipt.events?.find((event) => event.event === 'SwapWithCommission');
		console.log(event);
		const commission = (event as any).args[4];

		assertRoughlyEqualValues(commission.toString(), amountIn.mul(100).div(10000).toString(), 100);

		expect(receipt.status).to.be.eq(1);
	});
});
