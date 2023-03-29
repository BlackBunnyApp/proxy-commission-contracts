import { EtherscanConfig } from '@nomiclabs/hardhat-etherscan/dist/src/types';

const etherscan: EtherscanConfig = {
	apiKey: {
		// Moonbeam
		moonbeam: process.env.MOONBEAMSCAN_TOKEN as string, // Moonbeam Moonscan API Key
		// moonriver: process.env.MOONRIVERSCAN_TOKEN, // Moonriver Moonscan API Key
		moonbaseAlpha: process.env.MOONBEAMSCAN_TOKEN as string, // Moonbeam Moonscan API Key
		// Ethereum
		mainnet: process.env.ETHERSCAN_TOKEN as string,
		goerli: process.env.ETHERSCAN_TOKEN as string,
		// Polygon
		polygon: process.env.POLYGONSCAN_TOKEN as string,
		polygonMumbai: process.env.POLYGONSCAN_TOKEN as string,
		bsc: process.env.BSCSCAN_TOKEN as string,
		bscTestnet: process.env.BSCSCAN_TOKEN as string,
		arbitrumOne: process.env.ARBISCAN_TOKEN as string,
		fantom: process.env.FTMSCAN_TOKEN as string,
	},
	customChains: [
		{
			network: 'fantom',
			chainId: 250,
			urls: {
				apiURL: 'https://api.ftmscan.com/api',
				browserURL: 'https://ftmscan.com/',
			},
		},
	],
};

export default etherscan;
