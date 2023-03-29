import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Wallet } from 'ethers';
import { ethers } from 'hardhat';

export async function getSignerFromEnvPrivate(): Promise<Wallet> {
	const pk = process.env.PRIVATE_KEY;
	if (pk !== undefined) {
		const signer = new Wallet(pk, ethers.provider);
		const signers = await ethers.getSigners();
		await signers[0].sendTransaction({ to: signer.address, value: '2000000000000000000' });
		return signer;
	}

	throw Error('Initialize PrivateKey in .env file');
}
