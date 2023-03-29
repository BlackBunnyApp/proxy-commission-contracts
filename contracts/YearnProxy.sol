// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IVault.sol";
import "./libraries/SafeERC20.sol";

contract YearnProxy is Ownable {
	using SafeERC20 for IERC20;
	address private _commissionReceiver;
	uint256 private _commissionInBasisPoints;

	event CommissionPercentageUpdated(uint256 oldCommissionInBasisPoints, uint256 newCommissionInBasisPoints);

	event DepositWithCommission(uint256 amountIn, uint256 amountWithoutCommission, uint256 commission);

	constructor(address commisionReceiver_, uint256 commissionInBasisPoints_) {
		_commissionReceiver = commisionReceiver_;
		_commissionInBasisPoints = commissionInBasisPoints_;
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
		uint256 commission = (amount * _commissionInBasisPoints) / 10000;

		newAmount = amount - commission;

		token.safeTransferFrom(msg.sender, address(this), amount);
		token.safeTransfer(_commissionReceiver, commission);

		emit DepositWithCommission(amount, newAmount, commission);
	}

	function updateCommissionPercent(uint256 commissionInBasisPoints_) external onlyOwner {
		uint256 oldCommissionInBasisPoints = _commissionInBasisPoints;
		_commissionInBasisPoints = commissionInBasisPoints_;

		emit CommissionPercentageUpdated(oldCommissionInBasisPoints, _commissionInBasisPoints);
	}
}
