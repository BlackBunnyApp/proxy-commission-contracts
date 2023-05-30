import { ethers } from 'hardhat';

enum Commands {
	'00' = 'V3_SWAP_EXACT_IN',
	'01' = 'V3_SWAP_EXACT_OUT',
	'0b' = 'WRAP_ETH',
	'0c' = 'UNWRAP_ETH',
	'0a' = 'PERMIT2_PERMIT',
	'V3_SWAP_EXACT_IN' = '00',
	'V3_SWAP_EXACT_OUT' = '01',
	'WRAP_ETH' = '0b',
	'UNWRAP_ETH' = '0c',
	'PERMIT2_PERMIT' = '0a',
}

type CommandsToTypes = { [key in Commands]: string[] };

async function deploy() {
	const commandsToTypes: CommandsToTypes = {
		[Commands.V3_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.V3_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.PERMIT2_PERMIT]: ['PermitSingle', 'bytes'],
		[Commands.WRAP_ETH]: ['address', 'uint256'],
		[Commands.UNWRAP_ETH]: ['address', 'uint256'],
		[Commands['00']]: [],
		[Commands['01']]: [],
		[Commands['0b']]: [],
		[Commands['0c']]: [],
		[Commands['0a']]: [],
	};
	const rawTxData =
		// eslint-disable-next-line max-len
		'0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006474dc7b00000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000db0d400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f42791bca1f2de4661ed88a30c99a7a9449aa84174000000000000000000000000000000000000000000';

	// new ethers.utils.Interface(artifact.abi);
	const router = await ethers.getContractAt('IUniversalRouter', '0x4C60051384bd2d3C01bfc845Cf5F4b44bcbE9de5');
	const abi = new ethers.utils.AbiCoder();
	const routerInterface = router.interface;
	const decodedTx = routerInterface.decodeFunctionData('execute', rawTxData);

	console.log(decodedTx);

	const { commands, inputs } = decodedTx;

	for (let i = 2; i <= commands.length - 2; i += 2) {
		const command = commands.slice(i, i + 2) as Commands;
		console.log(command);
		const decodedSwapParams = abi.decode(commandsToTypes[command], inputs[i / 2 - 1]);
		console.log(decodedSwapParams);
	}

	console.log('Full params decoded');

	console.log(commands, inputs, Math.floor(new Date().getTime() / 1000) + 3000);
	// const decodedTx = abi.decode(['bytes', 'address', 'uint256', 'uint256', 'bytes', 'bool', 'uint256'], rawTxData);

	// console.log(decodedTx);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
