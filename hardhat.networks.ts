import dotenv from 'dotenv';
import { HardhatNetworkUserConfig, NetworksUserConfig, NetworkUserConfig } from 'hardhat/types';

dotenv.config();

function createEthereumNetworkConfig(networkName: keyof typeof chainIds = 'rinkeby'): NetworkUserConfig {
	return {
		url: 'https://' + networkName + '.infura.io/v3/' + process.env.INFURA_PROJECT_ID,
		chainId: chainIds[networkName],
		accounts: getDeploymentAccount(),
	};
}

function getDeploymentAccount(): string[] {
	return process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];
}

function isForkingLocal(isForking: boolean): HardhatNetworkUserConfig {
	if (!isForking) {
		return {};
	}

	return {
		forking: {
			url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
			// url: `https://1rpc.io/glmr`,
			// url: 'https://eth-rinkeby.alchemyapi.io/v2/y4o-h3QndsszyN2IqjF8myShdXud6RRc',
			// url: 'https://polygon-mumbai.g.alchemy.com/v2/xuvttDBAAQvHjBMWurgJzXCKjsWyp8x_',
		},
	};
}

export const chainIds = {
	// Ethereum
	mainnet: 1,
	ropsten: 3,
	rinkeby: 4,
	kovan: 42,
	goerli: 5,
	sepolia: 11155111,
	// Polygon
	polygon: 137,
	mumbai: 80001,
	// Binance
	'bsc-test': 97,
	'bsc-main': 56,
	// Development chains
	ganache: 1337,
	hardhat: 31337,
};

const networks: NetworksUserConfig = {
	// Ethereum
	hardhat: {
		chainId: 1,
		forking: {
			url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
			// 	// url: `https://1rpc.io/glmr`,
			// 	// url: 'https://eth-rinkeby.alchemyapi.io/v2/y4o-h3QndsszyN2IqjF8myShdXud6RRc',
			// 	// url: 'https://polygon-mumbai.g.alchemy.com/v2/xuvttDBAAQvHjBMWurgJzXCKjsWyp8x_',
		},
	},
	arbitrumOne: {
		url: 'https://arb1.arbitrum.io/rpc',
		accounts: getDeploymentAccount(),
	},
	mainnet: {
		url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
		accounts: [process.env.PRIVATE_KEY as string],
	},
	goerli: createEthereumNetworkConfig('goerli'),
	sepolia: createEthereumNetworkConfig('sepolia'),

	// Binance Smart Chain
	'bsc-main': {
		url: '',
		accounts: getDeploymentAccount(),
	},
	'bsc-test': {
		url: '',
		accounts: getDeploymentAccount(),
	},

	// Polygon
	polygon: {
		url: '',
		accounts: getDeploymentAccount(),
	},
	mumbai: {
		url: '',
		accounts: getDeploymentAccount(),
	},
	fantom: {
		url: 'https://rpcapi.fantom.network',
		chainId: 250,
		accounts: getDeploymentAccount(),
	},
};

export default networks;
