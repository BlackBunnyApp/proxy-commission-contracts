// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@uniswap/universal-router/contracts/libraries/Commands.sol";
import "@uniswap/universal-router/contracts/modules/uniswap/v3/BytesLib.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/universal-router/contracts/interfaces/IUniversalRouter.sol";
import "./libraries/SafeERC20.sol";

contract SwapProxy is Ownable {
	using SafeERC20 for IERC20;

	IUniversalRouter public router;
	address WETH;

	address private _feeReceiver;
	uint256 private _feeInBasisPoints;

	event FeePercentageUpdated(uint256 oldFeeInBasisPoints, uint256 newFeeInBasisPoints);

	event FeeReceiverUpdated(address oldFeeReceiver, address newFeeReceiver);

	// event SwapWithFee(
	// 	uint256 amountIn,
	// 	uint256 amountOut,
	// 	uint256 amountWithoutFee,
	// 	uint256 amountOutWithoutFee,
	// 	uint256 fee
	// );

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

	function executePlain(
		address inputToken,
		uint256 amount,
		bytes calldata commands,
		bytes[] memory inputs,
		uint256 deadline
	) public payable {
		if (inputToken == WETH) {
			// uint256 fee = deductEthFeeOptimized();
			router.execute{value: msg.value}(commands, inputs, deadline);
		} else {
			IERC20 token = IERC20(inputToken);

			token.safeTransferFrom(msg.sender, address(this), amount);
			token.approve(address(router), amount);

			router.execute(commands, inputs, deadline);
		}
	}

	/// @notice Executes swap on Uniswap UniversalRouter
	/// @dev swap params must already changed to be without fee amount
	/// @dev optimized version with off-chain calculation
	function execute(
		address inputToken,
		uint256 amount,
		bytes calldata commands,
		bytes[] memory inputs,
		uint256 deadline
	) public payable {
		if (inputToken == WETH) {
			uint256 fee = deductEthFeeOptimized();
			router.execute{value: msg.value - fee}(commands, inputs, deadline);
		} else {
			deductFeeOptimized(inputToken, amount);
			router.execute(commands, inputs, deadline);
		}
	}

	// Complex logic with high call cost
	// function execute1(
	// 	bytes calldata commands,
	// 	bytes[] memory inputs,
	// 	uint256 deadline
	// ) public payable {
	// 	uint256 numCommands = commands.length;

	// 	// loop through all given commands, execute them and pass along outputs as defined
	// 	for (uint256 commandIndex = 0; commandIndex < numCommands; ) {
	// 		bytes1 command = commands[commandIndex];

	// 		bytes memory input = inputs[commandIndex];

	// 		// Replace input with transformed one
	// 		inputs[commandIndex] = deductFeeAndTransformInputs(command, input);

	// 		unchecked {
	// 			commandIndex++;
	// 		}
	// 	}

	// 	router.execute(commands, inputs, deadline);
	// }

	// function deductFeeAndTransformInputs(bytes1 command, bytes memory input) public returns (bytes memory) {
	// 	if (
	// 		uint256(bytes32(command)) == Commands.V3_SWAP_EXACT_IN ||
	// 		uint256(bytes32(command)) == Commands.V3_SWAP_EXACT_OUT
	// 	) {
	// 		(address recipient, uint256 amountIn, uint256 amountOut, bytes memory path, bool fundsFromMsgSender) = abi
	// 			.decode(input, (address, uint256, uint256, bytes, bool));

	// 		address inputToken = this.getFirstTokenFromPath(path);

	// 		uint256 newAmountIn;
	// 		uint256 newAmountOut;

	// 		if (inputToken == WETH) {
	// 			(newAmountIn, newAmountOut) = deductEthFee(amountOut);
	// 		} else {
	// 			(newAmountIn, newAmountOut) = deductFee(inputToken, amountIn, amountOut);
	// 		}

	// 		return abi.encode(recipient, newAmountIn, newAmountOut, path, fundsFromMsgSender);
	// 	} else if (
	// 		uint256(bytes32(command)) == Commands.WRAP_ETH || uint256(bytes32(command)) == Commands.UNWRAP_WETH
	// 	) {
	// 		(address recipient, uint256 amount) = abi.decode(input, (address, uint256));

	// 		uint256 fee = (amount * _feeInBasisPoints) / 10000;

	// 		uint256 newAmount = amount - fee;
	// 		return abi.encode(recipient, newAmount);
	// 	} else {
	// 		return input;
	// 	}
	// }

	// function deductFee(
	// 	address srcToken,
	// 	uint256 amountIn,
	// 	uint256 amountOut
	// ) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
	// 	uint256 fee = (amountIn * _feeInBasisPoints) / 10000;

	// 	newAmountIn = amountIn - fee;
	// 	newAmountOut = (amountOut * (10000 - _feeInBasisPoints)) / 10000;

	// 	IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
	// 	IERC20(srcToken).safeTransfer(_feeReceiver, fee);

	// 	emit SwapWithFee(amountIn, amountOut, newAmountIn, newAmountOut, fee);
	// }

	// function deductEthFee(uint256 amountOut) internal returns (uint256 newAmountIn, uint256 newAmountOut) {
	// 	uint256 fee = (msg.value * _feeInBasisPoints) / 10000;

	// 	newAmountIn = msg.value - fee;
	// 	newAmountOut = (amountOut * (10000 - _feeInBasisPoints)) / 10000;

	// 	(bool success, ) = _feeReceiver.call{value: fee}("");
	// 	require(success, "Transfer to receiver failed");

	// 	emit SwapWithFee(msg.value, amountOut, newAmountIn, newAmountOut, fee);
	// }

	function deductFeeOptimized(address srcToken, uint256 amount) internal {
		uint256 fee = (amount * _feeInBasisPoints) / 10000;
		IERC20 token = IERC20(srcToken);

		token.safeTransferFrom(msg.sender, address(this), amount);
		token.safeTransfer(_feeReceiver, fee);
		token.approve(address(router), amount - fee);
	}

	function deductEthFeeOptimized() internal returns (uint256 fee) {
		fee = (msg.value * _feeInBasisPoints) / 10000;

		(bool success, ) = _feeReceiver.call{value: fee}("");
		require(success, "Transfer to receiver failed");
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
