import hardhat, { ethers } from 'hardhat';

async function deploy() {
	const tokenAddress = '0x07865c6E87B9F70255377e024ace6630C1Eaa37F';
	const swapProxyAddress = '0xe323ee07a92D48CB0bf4BBA77F98D102eE24b6b9';

	const amountIn = 193021290;
	const amountOutMin = 3413252235837498;
	const eth = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
	const receiver = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const path = [tokenAddress, eth];
	const deadline = Math.ceil(new Date().getTime() / 1000 + 360);

	const Token = await ethers.getContractFactory('ERC20');
	const token = Token.attach(tokenAddress);

	const allowance = await token.allowance(receiver, swapProxyAddress);
	console.log('Amount in', amountIn);
	console.log('Allowance', allowance.toString());

	if (allowance.lt(amountIn)) {
		console.log('Approving...');
		await token.approve(swapProxyAddress, '405215803964980100000000');
	}

	const SwapProxy = await ethers.getContractFactory('SwapProxy');
	const swapProxy = SwapProxy.attach(swapProxyAddress);

	console.log('Sending tx...');
	const tx = await swapProxy.swapExactTokensForETH(amountIn, amountOutMin, path, receiver, deadline);

	console.log(tx);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
