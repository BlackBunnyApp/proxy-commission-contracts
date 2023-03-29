import hardhat, { ethers } from 'hardhat';

async function deploy() {
	const yearnProxyAddress = '0x585B4Fc9a42349cdA28fA20068224aFbF98Ee5eD';
	const tokenAddress = '0x8e0B8c8BB9db49a46697F3a5Bb8A308e744821D2';
	const vault = '0x239e14A19DFF93a17339DCC444f74406C17f8E67';

	const amount = 867231283596358;
	const depositor = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';

	const YearnProxy = await ethers.getContractFactory('YearnProxy');
	const yearnProxy = YearnProxy.attach(yearnProxyAddress);

	const Token = await ethers.getContractFactory('ERC20');
	const token = Token.attach(tokenAddress);

	const allowance = await token.allowance(depositor, yearnProxyAddress);
	console.log('Amount in', amount);
	console.log('Allowance', allowance.toString());

	if (allowance.lt(amount)) {
		console.log('Approving...');
		await token.approve(yearnProxyAddress, '405215803964980100000000');
	}

	const tx = await yearnProxy.deposit(vault, tokenAddress, amount);
	console.log(tx);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
