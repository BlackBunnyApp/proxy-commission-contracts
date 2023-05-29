import '@typechain/hardhat';
import '@nomiclabs/hardhat-waffle';
import '@nomiclabs/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import 'hardhat-gas-reporter';
import 'hardhat-tracer';
import '@nomiclabs/hardhat-etherscan';
require('solidity-coverage'); // require because no TS typings available
import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import networks from './hardhat.networks';
import etherscan from './hardhat.etherscan';

dotenv.config();

const config: HardhatUserConfig = {
	solidity: {
		// version: '0.8.15',
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000000,
			},
			viaIR: true,
		},
		compilers: [
			{
				version: '0.8.17',
			},
			{
				version: '0.6.12',
			},
		],
	},
	// tracer: {
	// 	// tasks: ['run'],
	// 	stateOverrides: {
	// 		'0x3B27F92C0e212C671EA351827EDF93DB27cc0c65': {
	// 			storage: {
	// 				'1': '0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B',
	// 				'2': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	// 				'3': '0x037ef1821002d716E3C612beb23DCF4Ef338A405',
	// 				'4': '100',
	// 			},
	// 			bytecode: 'SwapProxy',
	// 		},
	// 		'0x235E066372bBC1c2129BDce6A3Be72321b97A756': {
	// 			storage: {
	// 				'1': '0x037ef1821002d716E3C612beb23DCF4Ef338A405',
	// 				'2': '100',
	// 			},
	// 			bytecode: 'YearnProxy',
	// 		},
	// 	},
	// 	// nameTags: {
	// 	// 	'0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B': 'UniversalRouter',
	// 	// },
	// },
	networks,
	etherscan,
	gasReporter: {
		enabled: true,
		// enabled: process.env.REPORT_GAS ? true : false,
		currency: 'USD',
		gasPrice: 40,
		coinmarketcap: 'af8ddfb6-5886-41fe-80b5-19259a3a03be',
	},
	typechain: {
		target: 'ethers-v5',
	},
};

export default config;
