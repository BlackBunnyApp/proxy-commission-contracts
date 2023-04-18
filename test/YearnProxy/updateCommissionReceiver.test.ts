import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { YearnProxy } from '../../typechain-types';

describe('updateCommissionReceiver()', async function () {
	const commissionReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const newCommissionReceiver = '0x2A40019ABd4A61d71aBB73968BaB068ab389a636';
	const commissionAmountIsBasisPoints = 100; // 1%

	async function deployYearnProxy(): Promise<YearnProxy> {
		const YearnProxy = await ethers.getContractFactory('YearnProxy');
		const yearnProxy = (await YearnProxy.deploy(commissionReceiver, commissionAmountIsBasisPoints)) as YearnProxy;
		return yearnProxy;
	}

	it('Updates commission percentage', async function () {
		const signers = await ethers.getSigners();
		const signer = signers[0];

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = await yearnProxy.connect(signer).updateCommissionReceiver(newCommissionReceiver);
		const receipt = await tx.wait();

		const event = receipt.events?.find((event) => event.event === 'CommissionReceiverUpdated');
		const oldReceiver = (event as any).args[0];
		const newReceiver = (event as any).args[1];

		expect(oldReceiver).to.equal(commissionReceiver);
		expect(newReceiver).to.equal(newCommissionReceiver);

		expect(receipt.status).to.be.eq(1);
	});

	it('Only owner', async function () {
		const signer = (await ethers.getSigners())[8];

		const yearnProxy = await loadFixture(deployYearnProxy);

		const tx = yearnProxy.connect(signer).updateCommissionReceiver(newCommissionReceiver);
		expect(tx).to.be.revertedWith('Ownable: caller is not the owner');
	});
});