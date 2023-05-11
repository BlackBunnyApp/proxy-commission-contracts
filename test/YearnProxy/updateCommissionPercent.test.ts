import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { YearnProxy } from '../../typechain-types';

describe('updateFeePercentage()', async function () {
	const feeReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const feeAmountIsBasisPoints = 100; // 1%
	const newFeeAmountIsBasisPoints = 1000; // 10%

	async function deployYearnProxy(): Promise<YearnProxy> {
		const YearnProxy = await ethers.getContractFactory('YearnProxy');
		const swapProxy = (await YearnProxy.deploy(feeReceiver, feeAmountIsBasisPoints)) as YearnProxy;
		return swapProxy;
	}

	it('Updates fee percentage', async function () {
		const signers = await ethers.getSigners();
		const signer = signers[0];

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = await yearnProxy.connect(signer).updateFeePercent(newFeeAmountIsBasisPoints);
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

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = yearnProxy.connect(signer).updateFeePercent(newFeeAmountIsBasisPoints);
		expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
	});
});
