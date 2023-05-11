// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UniswapRouter.sol";
import "./libraries/SafeERC20.sol";

contract SwapProxy is Ownable {
	using SafeERC20 for IERC20;
	IUniswapV2Router01 private _router;
	address private _feeReceiver;
	uint256 private _feeInBasisPoints;

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
		address feeReceiver_,
		uint256 feeInBasisPoints_
	) {
		_router = IUniswapV2Router01(router_);
		_feeReceiver = feeReceiver_;
		_feeInBasisPoints = feeInBasisPoints_;
	}

	function swapExactTokensForTokens(
		uint256 amountIn,
		uint256 amountOutMin,
		address[] calldata path,
		address to,
		uint256 deadline
	) external returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductFee(path[0], amountIn, amountOutMin);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapExactTokensForTokens(newAmountIn, newAmountOut, path, to, deadline);
	}

	function swapTokensForExactTokens(
		uint256 amountOut,
		uint256 amountInMax,
		address[] calldata path,
		address to,
		uint256 deadline
	) external returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductFee(path[0], amountInMax, amountOut);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapTokensForExactTokens(newAmountOut, newAmountIn, path, to, deadline);
	}

	function swapExactETHForTokens(
		uint256 amountOutMin,
		address[] calldata path,
		address to,
		uint256 deadline
	) external payable returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductEthFee(amountOutMin);

		amounts = _router.swapExactETHForTokens{value: newAmountIn}(newAmountOut, path, to, deadline);
		// amounts = _router.swapExactETHForTokens{value: msg.value}(amountOutMin, path, to, deadline);
	}

	function swapTokensForExactETH(
		uint256 amountOut,
		uint256 amountInMax,
		address[] calldata path,
		address to,
		uint256 deadline
	) external returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductFee(path[0], amountInMax, amountOut);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapTokensForExactETH(newAmountOut, newAmountIn, path, to, deadline);
	}

	function swapExactTokensForETH(
		uint256 amountIn,
		uint256 amountOutMin,
		address[] calldata path,
		address to,
		uint256 deadline
	) external returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductFee(path[0], amountIn, amountOutMin);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapExactTokensForETH(newAmountIn, newAmountOut, path, to, deadline);
	}

	function swapETHForExactTokens(
		uint256 amountOut,
		address[] calldata path,
		address to,
		uint256 deadline
	) external payable returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductEthFee(amountOut);

		amounts = _router.swapETHForExactTokens{value: newAmountIn}(newAmountOut, path, to, deadline);
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
}
