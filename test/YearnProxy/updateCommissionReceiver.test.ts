import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { YearnProxy } from '../../typechain-types';

describe('updateFeeReceiver()', async function () {
	const feeReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const newFeeReceiver = '0x2A40019ABd4A61d71aBB73968BaB068ab389a636';
	const feeAmountIsBasisPoints = 100; // 1%

	async function deployYearnProxy(): Promise<YearnProxy> {
		const YearnProxy = await ethers.getContractFactory('YearnProxy');
		const yearnProxy = (await YearnProxy.deploy(feeReceiver, feeAmountIsBasisPoints)) as YearnProxy;
		return yearnProxy;
	}

	it('Updates fee percentage', async function () {
		const signers = await ethers.getSigners();
		const signer = signers[0];

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = await yearnProxy.connect(signer).updateFeeReceiver(newFeeReceiver);
		const receipt = await tx.wait();

		const event = receipt.events?.find((event) => event.event === 'FeeReceiverUpdated');
		const oldReceiver = (event as any).args[0];
		const newReceiver = (event as any).args[1];

		expect(oldReceiver).to.equal(feeReceiver);
		expect(newReceiver).to.equal(newFeeReceiver);

		expect(receipt.status).to.be.eq(1);
	});

	it('Only owner', async function () {
		const signer = (await ethers.getSigners())[8];

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = yearnProxy.connect(signer).updateFeeReceiver(newFeeReceiver);
		expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
	});
});
