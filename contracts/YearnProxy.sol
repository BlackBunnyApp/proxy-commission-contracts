// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVault.sol";
import "./libraries/SafeERC20.sol";

contract YearnProxy is Ownable {
	using SafeERC20 for IERC20;
	address private _feeReceiver;
	uint256 private _feeInBasisPoints;

	event CommissionPercentageUpdated(uint256 oldCommissionInBasisPoints, uint256 newCommissionInBasisPoints);

	event CommissionReceiverUpdated(address oldCommissionReceiver, address newCommissionReceiver);

	event DepositWithCommission(uint256 amountIn, uint256 amountWithoutCommission, uint256 fee);

	constructor(address feeReceiver_, uint256 feeInBasisPoints_) {
		_feeReceiver = feeReceiver_;
		_feeInBasisPoints = feeInBasisPoints_;
	}

	function deposit(
		address vault,
		address token,
		uint256 amount
	) external returns (uint256) {
		IERC20 srcToken = IERC20(token);
		uint256 newAmount = deductCommission(srcToken, amount);

		srcToken.approve(vault, newAmount);
		return IVault(vault).deposit(newAmount, msg.sender);
	}

	function deductCommission(IERC20 token, uint256 amount) internal returns (uint256 newAmount) {
		uint256 fee = (amount * _feeInBasisPoints) / 10000;

		newAmount = amount - fee;

		token.safeTransferFrom(msg.sender, address(this), amount);
		token.safeTransfer(_feeReceiver, fee);

		emit DepositWithCommission(amount, newAmount, fee);
	}

	function updateCommissionPercent(uint256 feeInBasisPoints_) external onlyOwner {
		uint256 oldCommissionInBasisPoints = _feeInBasisPoints;
		_feeInBasisPoints = feeInBasisPoints_;

		emit CommissionPercentageUpdated(oldCommissionInBasisPoints, _feeInBasisPoints);
	}

	function updateCommissionReceiver(address feeReceiver_) external onlyOwner {
		address oldCommissionReceiver = _feeReceiver;
		_feeReceiver = feeReceiver_;

		emit CommissionReceiverUpdated(oldCommissionReceiver, _feeReceiver);
	}
}
