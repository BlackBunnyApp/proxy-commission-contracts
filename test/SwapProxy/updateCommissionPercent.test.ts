import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SwapProxy } from '../../typechain-types';

describe('updateFeePercentage()', async function () {
	const feeReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
	const feeAmountIsBasisPoints = 100; // 1%
	const newFeeAmountIsBasisPoints = 1000; // 10%

	async function deploySwapProxy(): Promise<SwapProxy> {
		const sushiSwap = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';

		const SwapProxy = await ethers.getContractFactory('SwapProxy');
		const swapProxy = (await SwapProxy.deploy(sushiSwap, weth, feeReceiver, feeAmountIsBasisPoints)) as SwapProxy;
		return swapProxy;
	}

	it('Updates fee percentage', async function () {
		const signers = await ethers.getSigners();
		const signer = signers[0];

		const swapProxy = await loadFixture(deploySwapProxy);

		const tx = await swapProxy.connect(signer).updateFeePercent(newFeeAmountIsBasisPoints);
		const receipt = await tx.wait();

		const event = receipt.events?.find((event) => event.event === 'FeePercentageUpdated');
		const oldFee = (event as any).args[0];
		const newFee = (event as any).args[1];

		expect(oldFee).to.equal(100);
		expect(newFee).to.equal(1000);

		expect(receipt.status).to.be.eq(1);
	});

	it('Only owner', async function () {
		const signer = (await ethers.getSigners())[8];

		const swapProxy = await loadFixture(deploySwapProxy);

		const tx = swapProxy.connect(signer).updateFeePercent(newFeeAmountIsBasisPoints);
		expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
	});
});
