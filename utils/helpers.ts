import { Contract } from 'ethers';

export async function getPoolImmutables(poolContract: Contract) {
	const [token0, token1, fee] = await Promise.all([poolContract.token0(), poolContract.token1(), poolContract.fee()]);

	return { token0, token1, fee };
}

export async function getPoolState(poolContract: Contract) {
	const slot = await poolContract.slot0();

	const state = {
		sqrtPriceX96: slot[0],
	};

	return state;
}
