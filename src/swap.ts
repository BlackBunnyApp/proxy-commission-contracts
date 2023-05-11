import { BigNumber } from 'ethers';
import hardhat, { ethers } from 'hardhat';
import { SwapProxy } from '../typechain-types';
import { getSignerFromEnvPrivate } from '../utils/getSignerFromEnvPrivate';

interface SwapTx {
	from: string;
	to: string;
	data: string;
	value: string;
	gasLimit: number;
	gasPrice: string;
}

async function main() {
	console.log('Chain ID', hardhat.network.config.chainId);

	const signer = await getSignerFromEnvPrivate();
	console.log('Signer', signer.address);

	const usdc = '0xd7067E6AcC2B703df74b7c83464c4dfB2Ee27d43';
	const eth = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
	const dai = '0x6B175474E89094C44Da98b954EedeAC495271d0F';
	const sushi = '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2';

	const sushiSwap = '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F';
	const feeReceiver = '0xd7067e6acc2b703df74b7c83464c4dfb2ee27d43';
	const feeAmountIsBasisPoints = 100; // 1%

	const SwapProxy = await ethers.getContractFactory('SwapProxy');
	const swapProxy = (await SwapProxy.deploy(sushiSwap, feeReceiver, feeAmountIsBasisPoints)) as SwapProxy;
	console.log('SwapProxy deployed at', swapProxy.address);

	const amountIn = BigNumber.from('10000000000000000');
	const amountOut = BigNumber.from('8239684797700350');
	const pathDaiToSushi = [dai, sushi];
	const deadline = Math.floor(new Date().getTime() / 1000) + 120;

	const tx = await swapProxy.swapExactTokensForTokens(amountIn, amountOut, pathDaiToSushi, signer.address, deadline);
	const receipt = await tx.wait();
	console.log(receipt);
}

main()
	.then(() => (process.exitCode = 0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});
