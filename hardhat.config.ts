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
				version: '0.8.15',
			},
			{
				version: '0.6.12',
			},
		],
	},
	networks,
	etherscan,
	gasReporter: {
		enabled: true,
	},
	typechain: {
		target: 'ethers-v5',
	},
};

export default config;
