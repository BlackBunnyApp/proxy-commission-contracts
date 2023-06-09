# Fee proxy contracts

# YearnProxy

Basically, it’s contract to make proxied swaps with taking fee. Contract uses UniswapV2Router as implementation (basically accounted to use SushiSwap router contract).

Uses Yearn Vault technology and contracts to make swaps via the **deposit()** method

```solidity
function deposit(
	address vault,
	address token,
	uint256 amount
) external returns (uint256) {
	IERC20 srcToken = IERC20(token);
	uint256 newAmount = deductFee(srcToken, amount);

	srcToken.approve(vault, newAmount);
	return IVault(vault).deposit(newAmount, msg.sender);
}

```

and deposit() calls **deductFee()**

```solidity
function deductFee(IERC20 token, uint256 amount)
	internal
	returns (uint256 newAmount)
{
	uint256 fee = (amount * _feeInBasisPoints) / 10000;

	newAmount = amount - fee;

	token.safeTransferFrom(msg.sender, address(this), amount);
	token.safeTransfer(_feeReceiver, fee);

	emit DepositWithFee(amount, newAmount, fee);
}

```

## Fee

Calling any of listed above methods also calls **deductFee()** or **deductEthFee()** (base on what token is taken as input, named as amountIn in Uniswap).

Fee calculated as follows (for eth):

```solidity
uint256 fee = (msg.value * _feeInBasisPoints) / 10000;
```

And for tokens:

```solidity
uint256 fee = (amountIn * _feeInBasisPoints) / 10000;
```

and then transfered to SwapProxy contract (to make approve for following swap) and part of it is sent to **\_feeReceiver**:

```solidity
IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
IERC20(srcToken).safeTransfer(_feeReceiver, fee);
```

### Change fee

**\_feeInBasisPoints** is specified on contract dpeloyment and can be changed via **updateFeePercent()** function (can only be called by the contract owner)

```solidity
function updateFeePercent(uint256 feeInBasisPoints_) external onlyOwner {
	uint256 oldFeeInBasisPoints = _feeInBasisPoints;
	_feeInBasisPoints = feeInBasisPoints_;

	emit FeePercentageUpdated(oldFeeInBasisPoints, _feeInBasisPoints);
}

```

Fee is specified in **basis points**, not in percents (to make calculation more precise, despite the absence of floating point numbers in solidity). For example:

1 basis point = 0.01%

100 basis points = 1%

200 basis points = 2%

1000 basis points = 10%

When the fee changed - the **FeePercentageUpdated** event is emited.

### Change fee receiver

**\_feeReceiver** is specified on contract dpeloyment and can be changed via **updateFeeReceiver()** function (can only be called by the contract owner)

```solidity
function updateFeeReceiver(uint256 feeReceiver_) external onlyOwner {
	uint256 oldFeeReceiver = _feeReceiver;
	_feeReceiver = feeReceiver_;

	emit FeeReceiverUpdated(oldFeeReceiver, _feeReceiver);
}

```

When the fee receiver changed - the **FeeReceiverUpdated** event is emited.

## Ownable

Contract has owner - the address that has rights to change **\_feePercentageInBasisPoints** and **\_feeReceiver** properties

To change owner of the contract **transferOwnership** method should be called (can only be called by _current owner_)

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner {
	require(newOwner != address(0), "Ownable: new owner is the zero address");
	_transferOwnership(newOwner);
}

```

## SafeERC20

Uses SafeERC20 library to make transfer safer.

# SwapProxy

Basically, it’s contract to make proxied swaps with taking fee. Contract uses UniswapV2Router as implementation (basically accounted to use SushiSwap router contract).

Uses Uniswap V2 technology to make swaps via following methods:

-   swapExactTokensForTokens()
-   swapExactTokensForEth()
-   swapExactEthForTokens()
-   swapEthForExactTokens()
-   swapTokensForExactTokens()
-   swapTokensForExactEth()

## Fee

Calling any of listed above methods also calls **deductFee()** or **deductEthFee()** (base on what token is taken as input, named as amountIn in Uniswap).

Fee calculated as follows (for eth):

```solidity
uint256 fee = (msg.value * _feeInBasisPoints) / 10000;
```

And for tokens:

```solidity
uint256 fee = (amountIn * _feeInBasisPoints) / 10000;
```

and then transfered to SwapProxy contract (to make approve for following swap) and part of it is sent to **\_feeReceiver**:

```solidity
IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
IERC20(srcToken).safeTransfer(_feeReceiver, fee);
```

### Change fee

**\_feeInBasisPoints** is specified on contract dpeloyment and can be changed via **updateFeePercent()** function (can only be called by the contract owner)

```solidity
function updateFeePercent(uint256 feeInBasisPoints_) external onlyOwner {
	uint256 oldFeeInBasisPoints = _feeInBasisPoints;
	_feeInBasisPoints = feeInBasisPoints_;

	emit FeePercentageUpdated(oldFeeInBasisPoints, _feeInBasisPoints);
}

```

Fee is specified in **basis points**, not in percents (to make calculation more precise, despite the absence of floating point numbers in solidity). For example:

1 basis point = 0.01%

100 basis points = 1%

200 basis points = 2%

1000 basis points = 10%

When the fee changed - the **FeePercentageUpdated** event is emited.

### Change fee receiver

**\_feeReceiver** is specified on contract dpeloyment and can be changed via **updateFeeReceiver()** function (can only be called by the contract owner)

```solidity
function updateFeeReceiver(uint256 feeReceiver_) external onlyOwner {
	uint256 oldFeeReceiver = _feeReceiver;
	_feeReceiver = feeReceiver_;

	emit FeeReceiverUpdated(oldFeeReceiver, _feeReceiver);
}

```

When the fee receiver changed - the **FeeReceiverUpdated** event is emited.

## Ownable

Contract has owner - the address that has rights to change **\_feePercentageInBasisPoints** and **\_feeReceiver** properties

To change owner of the contract **transferOwnership** method should be called (can only be called by _current owner_)

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner {
	require(newOwner != address(0), "Ownable: new owner is the zero address");
	_transferOwnership(newOwner);
}

```

## SafeERC20

Uses SafeERC20 library to make transfer safer.
