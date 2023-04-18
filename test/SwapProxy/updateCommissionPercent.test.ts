import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SwapProxy } from '../../typechain-types';

describe('updateCommissionPercentage()', async function () {
	const commissionReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const commissionAmountIsBasisPoints = 100; // 1%
	const newCommissionAmountIsBasisPoints = 1000; // 10%

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

	it('Updates commission percentage', async function () {
		const signers = await ethers.getSigners();
		const signer = signers[0];

		const swapProxy = await loadFixture(deploySwapProxy);

		const tx = await swapProxy.connect(signer).updateCommissionPercent(newCommissionAmountIsBasisPoints);
		const receipt = await tx.wait();

		const event = receipt.events?.find((event) => event.event === 'CommissionPercentageUpdated');
		const oldCommission = (event as any).args[0];
		const newCommission = (event as any).args[1];

		expect(oldCommission).to.equal(100);
		expect(newCommission).to.equal(1000);

		expect(receipt.status).to.be.eq(1);
	});

	it('Only owner', async function () {
		const signer = (await ethers.getSigners())[8];

		const swapProxy = await loadFixture(deploySwapProxy);

		const tx = swapProxy.connect(signer).updateCommissionPercent(newCommissionAmountIsBasisPoints);
		expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
	});
});