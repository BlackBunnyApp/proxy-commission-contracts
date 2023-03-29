// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UniswapRouter.sol";
import "./libraries/SafeERC20.sol";

contract SwapProxy is Ownable {
	using SafeERC20 for IERC20;
	IUniswapV2Router01 private _router;
	address private _commisionReceiver;
	uint256 private _commissionInBasisPoints;

	event CommissionPercentageUpdated(uint256 oldCommissionInBasisPoints, uint256 newCommissionInBasisPoints);

	event SwapWithCommission(
		uint256 amountIn,
		uint256 amountOut,
		uint256 amountWithoutCommission,
		uint256 amountOutWithoutCommission,
		uint256 commission
	);

	constructor(
		address router_,
		address commisionReceiver_,
		uint256 commissionInBasisPoints_
	) {
		_router = IUniswapV2Router01(router_);
		_commisionReceiver = commisionReceiver_;
		_commissionInBasisPoints = commissionInBasisPoints_;
	}

	function swapExactTokensForTokens(
		uint256 amountIn,
		uint256 amountOutMin,
		address[] calldata path,
		address to,
		uint256 deadline
	) external returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductCommission(path[0], amountIn, amountOutMin);

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
		(uint256 newAmountIn, uint256 newAmountOut) = deductCommission(path[0], amountInMax, amountOut);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapTokensForExactTokens(newAmountOut, newAmountIn, path, to, deadline);
	}

	function swapExactETHForTokens(
		uint256 amountOutMin,
		address[] calldata path,
		address to,
		uint256 deadline
	) external payable returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductEthCommission(amountOutMin);

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
		(uint256 newAmountIn, uint256 newAmountOut) = deductCommission(path[0], amountInMax, amountOut);

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
		(uint256 newAmountIn, uint256 newAmountOut) = deductCommission(path[0], amountIn, amountOutMin);

		IERC20(path[0]).approve(address(_router), newAmountIn);

		amounts = _router.swapExactTokensForETH(newAmountIn, newAmountOut, path, to, deadline);
	}

	function swapETHForExactTokens(
		uint256 amountOut,
		address[] calldata path,
		address to,
		uint256 deadline
	) external payable returns (uint256[] memory amounts) {
		(uint256 newAmountIn, uint256 newAmountOut) = deductEthCommission(amountOut);

		amounts = _router.swapETHForExactTokens{value: newAmountIn}(newAmountOut, path, to, deadline);
	}

	function deductCommission(
		address srcToken,
		uint256 amountIn,
		uint256 amountOut
	) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
		uint256 commission = (amountIn * _commissionInBasisPoints) / 10000;

		newAmountIn = amountIn - commission;
		newAmountOut = (amountOut * (10000 - _commissionInBasisPoints)) / 10000;

		IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
		IERC20(srcToken).safeTransfer(_commisionReceiver, commission);

		emit SwapWithCommission(amountIn, amountOut, newAmountIn, newAmountOut, commission);
	}

	function deductEthCommission(uint256 amountOut) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
		uint256 commission = (msg.value * _commissionInBasisPoints) / 10000;

		newAmountIn = msg.value - commission;
		newAmountOut = (amountOut * (10000 - _commissionInBasisPoints)) / 10000;

		(bool success, ) = _commisionReceiver.call{value: commission}("");
		require(success, "Transfer to receiver failed");

		emit SwapWithCommission(msg.value, amountOut, newAmountIn, newAmountOut, commission);
	}

	function updateCommissionPercent(uint256 commissionInBasisPoints_) external onlyOwner {
		uint256 oldCommissionInBasisPoints = _commissionInBasisPoints;
		_commissionInBasisPoints = commissionInBasisPoints_;

		emit CommissionPercentageUpdated(oldCommissionInBasisPoints, _commissionInBasisPoints);
	}
}
