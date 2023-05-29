import { ethers } from 'hardhat';

enum Commands {
	'00' = 'V3_SWAP_EXACT_IN',
	'01' = 'V3_SWAP_EXACT_OUT',
	'0b' = 'WRAP_ETH',
	'0c' = 'UNWRAP_ETH',
	'V3_SWAP_EXACT_IN' = '00',
	'V3_SWAP_EXACT_OUT' = '01',
	'WRAP_ETH' = '0b',
	'UNWRAP_ETH' = '0c',
}

type CommandsToTypes = { [key in Commands]: string[] };

async function deploy() {
	const abi = new ethers.utils.AbiCoder();

	const commandsToTypes: CommandsToTypes = {
		[Commands.V3_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.V3_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.WRAP_ETH]: ['address', 'uint256'],
		[Commands.UNWRAP_ETH]: ['address', 'uint256'],
		[Commands['00']]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands['01']]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands['0b']]: ['address', 'uint256'],
		[Commands['0c']]: ['address', 'uint256'],
	};

	const rawTxData =
		// eslint-disable-next-line max-len
		'0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006473950f00000000000000000000000000000000000000000000000000000000000000020b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000def1600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b0d500b1d8e8ef31e21c99d1db9a6444d3adf12700001f4c2132d05d31c914a87c6611c10748aeb04b58e8f000000000000000000000000000000000000000000';

	// new ethers.utils.Interface(artifact.abi);
	const { commands, inputs, deadline } = await decodeSwapParams(rawTxData);
	console.log(commands, inputs, deadline);

	console.log('Decoding arguments...');

	for (let i = 2; i <= commands.length - 2; i += 2) {
		const command = commands.slice(i, i + 2) as Commands;

		console.log('Command', command);

		const index = i / 2 - 1;
		const decodedSwapParams = abi.decode(commandsToTypes[command], inputs[index]);
		console.log(decodedSwapParams);

		if (command === Commands.V3_SWAP_EXACT_IN || command === Commands.V3_SWAP_EXACT_OUT) {
			const [recipient, , , path, fromUserFlag] = decodedSwapParams;
			let [, amountIn, amountOut, ,] = decodedSwapParams;

			amountIn = (amountIn - Math.floor((amountIn * 100) / 10000)).toString();
			amountOut = (amountOut - Math.floor((amountOut * 100) / 10000)).toString();

			const newInput = abi.encode(commandsToTypes.V3_SWAP_EXACT_IN, [
				recipient,
				amountIn,
				amountOut,
				path,
				fromUserFlag,
			]);

			inputs[index] = newInput;

			const newDecodedSwapParams = abi.decode(commandsToTypes[command], inputs[index]);
			console.log('New command inputs', newDecodedSwapParams);
		} else if (command === Commands.WRAP_ETH || command === Commands.UNWRAP_ETH) {
			// eslint-disable-next-line prefer-const
			let [recipient, amount] = decodedSwapParams;

			amount = (amount - Math.floor((amount * 100) / 10000)).toString();

			const newInput = abi.encode(commandsToTypes.WRAP_ETH, [recipient, amount]);
			inputs[index] = newInput;

			const newDecodedSwapParams = abi.decode(commandsToTypes[command], inputs[index]);
			console.log('New command inputs', newDecodedSwapParams);
		}
	}

	console.log('\nNew raw tx data:');

	const newTxData = await encodeSwapParams(commands, inputs);
	console.log(newTxData);

	const newDecodedTx = await decodeSwapParams(newTxData);
	console.log('');
	console.log(newDecodedTx);
	// const decodedTx = abi.decode(['bytes', 'address', 'uint256', 'uint256', 'bytes', 'bool', 'uint256'], rawTxData);
}

async function decodeSwapParams(rawTxData: string) {
	const router = await ethers.getContractAt('IUniversalRouter', '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B');
	const routerInterface = router.interface;
	const decodedTx = routerInterface.decodeFunctionData('execute', rawTxData);

	const [commands, inputs, deadline] = JSON.parse(JSON.stringify(decodedTx));
	return { commands, inputs, deadline };
}

async function encodeSwapParams(commands: string, inputs: string[]): Promise<string> {
	const router = await ethers.getContractAt('IUniversalRouter', '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B');
	const routerInterface = router.interface;

	return routerInterface.encodeFunctionData('execute', [
		commands,
		inputs,
		Math.floor(new Date().getTime() / 1000) + 1000,
	]);
}

deploy()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
