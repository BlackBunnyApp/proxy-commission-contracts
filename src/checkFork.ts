import { Wallet } from 'ethers';
import hardhat, { ethers } from 'hardhat';

async function main() {
	console.log('Chain ID', hardhat.network.config.chainId);

	const balance = await ethers.provider.getBalance('0xd7067e6acc2b703df74b7c83464c4dfb2ee27d43');
	console.log(balance);
}

main()
	.then(() => (process.exitCode = 0))
	.catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
