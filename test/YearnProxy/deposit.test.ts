import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';
import { assertRoughlyEqualValues } from '../../src';
import { ERC20, YearnProxy } from '../../typechain-types';
import { getSignerFromEnvPrivate } from '../../utils/getSignerFromEnvPrivate';

describe('deposit', async function () {
	const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
	const daiVault = '0xdA816459F1AB5631232FE5e97a05BBBb94970c95';

	const amountIn = BigNumber.from('10000000000000000');

	const commissionReceiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const commissionAmountIsBasisPoints = 200; // 2%

	async function deployYearnProxy(): Promise<YearnProxy> {
		const YearnProxy = await ethers.getContractFactory('YearnProxy');
		const yearnProxy = (await YearnProxy.deploy(commissionReceiver, commissionAmountIsBasisPoints)) as YearnProxy;
		return yearnProxy;
	}

	it('Deposit happens and commission taken', async function () {
		const Dai = await ethers.getContractFactory('ERC20');
		const daiContract = Dai.attach(dai) as ERC20;
		const signer = await getSignerFromEnvPrivate();

		const yearnProxy = await loadFixture(deployYearnProxy);

		const approve = await daiContract.connect(signer).approve(yearnProxy.address, amountIn);
		await approve.wait();

		// console.log('Allowance', formatEther(await daiContract.allowance(signer.address, swapProxy.address)));

		const tx = await yearnProxy.connect(signer).deposit(daiVault, dai, amountIn);
		const receipt = await tx.wait();
		console.log(receipt);

		const event = receipt.events?.find((event) => event.event === 'DepositWithCommission');
		// console.log(event);
		const commission = (event as any).args[2];

		assertRoughlyEqualValues(
			commission.toString(),
			amountIn.mul(commissionAmountIsBasisPoints).div(10000).toString(),
			100,
		);

		expect(receipt.status).to.be.eq(1);
	});
});
