// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@uniswap/universal-router/contracts/libraries/Commands.sol";
import "@uniswap/universal-router/contracts/modules/uniswap/v3/BytesLib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import "./libraries/SafeERC20.sol";

contract SwapProxy is Ownable {
	IUniversalRouter public router;
	address public WETH;

	address private _feeReceiver;
	uint256 private _feeInBasisPoints;

	using SafeERC20 for IERC20;

	event FeePercentageUpdated(uint256 oldFeeInBasisPoints, uint256 newFeeInBasisPoints);

	event FeeReceiverUpdated(address oldFeeReceiver, address newFeeReceiver);

	event SwapWithFee(
		uint256 amountIn,
		uint256 amountOut,
		uint256 amountWithoutFee,
		uint256 amountOutWithoutFee,
		uint256 fee
	);

	constructor(
		address router_,
		address weth_,
		address feeReceiver_,
		uint256 feeInBasisPoints_
	) {
		router = IUniversalRouter(router_);
		WETH = weth_;

		_feeReceiver = feeReceiver_;
		_feeInBasisPoints = feeInBasisPoints_;
	}

	function deductFee(
		address srcToken,
		uint256 amountIn,
		uint256 amountOut
	) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
		uint256 fee = (amountIn * _feeInBasisPoints) / 10000;

		newAmountIn = amountIn - fee;
		newAmountOut = (amountOut * (10000 - _feeInBasisPoints)) / 10000;

		IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
		IERC20(srcToken).safeTransfer(_feeReceiver, fee);

		emit SwapWithFee(amountIn, amountOut, newAmountIn, newAmountOut, fee);
	}

	function deductEthFee(uint256 amountOut) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
		uint256 fee = (msg.value * _feeInBasisPoints) / 10000;

		newAmountIn = msg.value - fee;
		newAmountOut = (amountOut * (10000 - _feeInBasisPoints)) / 10000;

		(bool success, ) = _feeReceiver.call{value: fee}("");
		require(success, "Transfer to receiver failed");

		emit SwapWithFee(msg.value, amountOut, newAmountIn, newAmountOut, fee);
	}

	function updateFeePercent(uint256 feeInBasisPoints_) external onlyOwner {
		uint256 oldFeeInBasisPoints = _feeInBasisPoints;
		_feeInBasisPoints = feeInBasisPoints_;

		emit FeePercentageUpdated(oldFeeInBasisPoints, _feeInBasisPoints);
	}

	function updateFeeReceiver(address feeReceiver_) external onlyOwner {
		address oldFeeReceiver = _feeReceiver;
		_feeReceiver = feeReceiver_;

		emit FeeReceiverUpdated(oldFeeReceiver, _feeReceiver);
	}

	/// @dev Needed to call by this._bytesToAddress()
	/// @dev otherwise toAddress  can't take bytes memory
	function getFirstTokenFromPath(bytes calldata path) public pure returns (address) {
		return BytesLib.toAddress(path);
	}
}
