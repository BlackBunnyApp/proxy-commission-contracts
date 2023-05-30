import { ethers } from 'hardhat';

enum Commands {
	'00' = 'V3_SWAP_EXACT_IN',
	'01' = 'V3_SWAP_EXACT_OUT',
	'02' = 'PERMIT2_TRANSFER_FROM',
	'0a' = 'PERMIT2_PERMIT',
	'0b' = 'WRAP_ETH',
	'0c' = 'UNWRAP_ETH',
	'V3_SWAP_EXACT_IN' = '00',
	'V3_SWAP_EXACT_OUT' = '01',
	'PERMIT2_TRANSFER_FROM' = '02',
	'PERMIT2_PERMIT' = '0a',
	'WRAP_ETH' = '0b',
	'UNWRAP_ETH' = '0c',
}

type CommandsToTypes = { [key in Commands]: string[] };

async function subtractFeeInDataOfRawTx(rawTxData: string, isLoggingEnabled = false) {
	const { commands, inputs, deadline } = await decodeSwapParams(rawTxData);
	const newParams = await subtractFeeInParams(commands, inputs, deadline, isLoggingEnabled);

	log('\nNew raw tx data:');

	const newTxData = await encodeSwapParams(newParams.commands, newParams.inputs);
	console.log(newTxData);

	const newDecodedTx = await decodeSwapParams(newTxData);
	log('');
	log(newDecodedTx);
	log(Number(newDecodedTx.deadline.hex));

	function log(...content: any[]) {
		if (!isLoggingEnabled) return;
		console.log(...content);
	}
}

export async function subtractFeeInParams(
	commands: string,
	inputs: string[],
	deadline: number,
	isLoggingEnabled = false,
) {
	const abi = new ethers.utils.AbiCoder();

	const commandsToTypes: CommandsToTypes = {
		[Commands.V3_SWAP_EXACT_IN]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.V3_SWAP_EXACT_OUT]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands.PERMIT2_TRANSFER_FROM]: ['address', 'address', 'uint256'],
		[Commands.PERMIT2_PERMIT]: ['bytes', 'uint256'],
		[Commands.WRAP_ETH]: ['address', 'uint256'],
		[Commands.UNWRAP_ETH]: ['address', 'uint256'],
		[Commands['00']]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands['01']]: ['address', 'uint256', 'uint256', 'bytes', 'bool'],
		[Commands['02']]: ['address', 'address', 'uint256'],
		[Commands['0a']]: ['bytes', 'uint256'],
		[Commands['0b']]: ['address', 'uint256'],
		[Commands['0c']]: ['address', 'uint256'],
	};

	const user = '0xc7ae8f9Ea8bb06A04e98d43a941Dff8454e6ad36';
	const MSG_SENDER = '0x0000000000000000000000000000000000000001'; // constant for msg.sender on Router contract
	const UNIVERSAL_ROUTER = '0x0000000000000000000000000000000000000002'; // constant fro address(this) on Router contract

	// eslint-disable-next-line prefer-const
	log(commands, inputs, deadline);

	log('Decoding arguments...');

	for (let i = 2; i <= commands.length - 2; i += 2) {
		const command = commands.slice(i, i + 2) as Commands;

		log('Command', command);

		const index = i / 2 - 1;

		if (command === Commands.PERMIT2_PERMIT) {
			commands = (commands as string).replace('0a', '');

			(inputs as string[]).splice(index, 1);
			// Return index to previous position after changing commands.length
			i -= 2;

			log('Removed PERMIT');

			// const token = '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063';
			// // const recipient = UNIVERSAL_ROUTER;
			// const recipient = '0x254aa3A898071D6A2dA0DB11dA73b02B4646078F'; // DAI-MATIC pool
			// const amount = BigNumber.from('495000000000000000');
			// const fee = amount.mul('100').div(10000);
			// const amountToPermit = amount.sub(fee);

			// console.log(inputs[index]);

			// inputs[index] = abi.encode(commandsToTypes[Commands.PERMIT2_TRANSFER_FROM], [
			// 	token,
			// 	recipient,
			// 	amountToPermit,
			// ]);

			// console.log(inputs[index]);
			// console.log(commandsToTypes[Commands.PERMIT2_TRANSFER_FROM]);

			// const newDecodedSwapParams = abi.decode(commandsToTypes[Commands.PERMIT2_TRANSFER_FROM], inputs[index]);
			// console.log('New command inputs', newDecodedSwapParams);

			continue;
		}

		const decodedSwapParams = abi.decode(commandsToTypes[command], inputs[index]);
		console.log(decodedSwapParams);

		if (command === Commands.V3_SWAP_EXACT_IN || command === Commands.V3_SWAP_EXACT_OUT) {
			// eslint-disable-next-line prefer-const
			let [recipient, amountIn, amountOut, path, fromUserFlag] = decodedSwapParams;

			// Make user a recipient insted of msg.sender (SwapProxy)
			if (recipient === MSG_SENDER) {
				recipient = user;
			}

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
		} else if (command === Commands.WRAP_ETH || command === Commands.UNWRAP_ETH) {
			// eslint-disable-next-line prefer-const
			let [recipient, amount] = decodedSwapParams;

			// Make user a recipient insted of msg.sender (SwapProxy)
			if (recipient === MSG_SENDER) {
				recipient = user;
			}

			amount = (amount - Math.floor((amount * 100) / 10000)).toString();

			const newInput = abi.encode(commandsToTypes.WRAP_ETH, [recipient, amount]);
			inputs[index] = newInput;
		}

		const newDecodedSwapParams = abi.decode(commandsToTypes[command], inputs[index]);
		log('New command inputs', newDecodedSwapParams);
	}
	// const decodedTx = abi.decode(['bytes', 'address', 'uint256', 'uint256', 'bytes', 'bool', 'uint256'], rawTxData);

	function log(...content: any[]) {
		if (!isLoggingEnabled) return;
		console.log(...content);
	}

	return { commands, inputs };
}

async function decodeSwapParams(rawTxData: string) {
	const router = await ethers.getContractAt('IUniversalRouter', '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B');
	const routerInterface = router.interface;
	const decodedTx = routerInterface.decodeFunctionData('execute', rawTxData);

	const [commands, inputs, deadline] = JSON.parse(JSON.stringify(decodedTx));
	return { commands, inputs, deadline };
}
// 0xc2132d05d31c914a87c6611c10748aeb04b58e8f
// 0x0001f4 - fee
// 0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270
async function encodeSwapParams(commands: string, inputs: string[]): Promise<string> {
	const router = await ethers.getContractAt('IUniversalRouter', '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B');
	const routerInterface = router.interface;

	return routerInterface.encodeFunctionData('execute', [
		commands,
		inputs,
		Math.floor(new Date().getTime() / 1000) + 60 * 60,
	]);
}

subtractFeeInDataOfRawTx(
	// eslint-disable-next-line max-len
	'0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000006475f79600000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000f42400000000000000000000000000000000000000000000000000ef7d1f0b67c76e800000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002bc2132d05d31c914a87c6611c10748aeb04b58e8f0001f40d500b1d8e8ef31e21c99d1db9a6444d3adf1270000000000000000000000000000000000000000000',
	// Example tx swap data
	true,
)
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error);
		process.exit(1);
	});
