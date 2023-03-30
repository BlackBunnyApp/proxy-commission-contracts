# Commission proxy contracts

# YearnProxy

Basically, it’s contract to make proxied swaps with taking commission. Contract uses UniswapV2Router as implementation (basically accounted to use SushiSwap router contract).

Uses Yearn Vault technology and contracts to make swaps via the **deposit()** method

```solidity
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
```

and deposit() calls **deductCommission()**

```solidity
function deductCommission(IERC20 token, uint256 amount) internal returns (uint256 newAmount) {
		uint256 commission = (amount * _commissionInBasisPoints) / 10000;

		newAmount = amount - commission;

		token.safeTransferFrom(msg.sender, address(this), amount);
		token.safeTransfer(_commissionReceiver, commission);

		emit DepositWithCommission(amount, newAmount, commission);
	}
```

## Commission

Calling any of listed above methods also calls **deductCommission()** or **deductEthCommission()** (base on what token is taken as input, named as amountIn in Uniswap).

Commission calculated as follows (for eth):

```solidity
uint256 commission = (msg.value * _commissionInBasisPoints) / 10000;
```

And for tokens:

```solidity
uint256 commission = (amountIn * _commissionInBasisPoints) / 10000;
```

and then transfered to SwapProxy contract (to make approve for following swap) and part of it is sent to **_commissionReceiver**:

```solidity
IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
IERC20(srcToken).safeTransfer(_commisionReceiver, commission);
```

### Change commission

**_commissionInBasisPoints** is specified on contract dpeloyment and can be changed via **updateCommissionPercent()** function (can only be called by the contract owner)

```solidity
function updateCommissionPercent(uint256 commissionInBasisPoints_) external onlyOwner {
		uint256 oldCommissionInBasisPoints = _commissionInBasisPoints;
		_commissionInBasisPoints = commissionInBasisPoints_;

		emit CommissionPercentageUpdated(oldCommissionInBasisPoints, _commissionInBasisPoints);
	}
```

Commission is specified in **basis points**, not in percents (to make calculation more precise, despite the absence of floating point numbers in solidity). For example:

1 basis point = 0.01% 

100 basis points = 1%

200 basis points = 2%

1000 basis points = 10%

When the commission changed - the **CommissionPercentageUpdated** event is emited.

### Change commission receiver

**_commissionReceiver** is specified on contract dpeloyment and can be changed via **updateCommissionReceiver()** function (can only be called by the contract owner)

```solidity
function updateCommissionReceiver(uint256 commisionReceiver_) external onlyOwner {
		uint256 oldCommissionReceiver = _commisionReceiver;
		_commisionReceiver = commisionReceiver_;

		emit CommissionReceiverUpdated(oldCommissionReceiver, _commissionReceiver);
}
```

When the commission receiver changed - the **CommissionReceiverUpdated** event is emited.

## Ownable

Contract has owner - the address that has rights to change **_commissionPercentageInBasisPoints** and **_commissionReceiver** properties

To change owner of the contract **transferOwnership** method should be called (can only be called by *current owner*)

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    _transferOwnership(newOwner);
}
```

## SafeERC20

Uses SafeERC20 library to make transfer safer.

# SwapProxy

Basically, it’s contract to make proxied swaps with taking commission. Contract uses UniswapV2Router as implementation (basically accounted to use SushiSwap router contract).

Uses Uniswap V2 technology to make swaps via following methods:

- swapExactTokensForTokens()
- swapExactTokensForEth()
- swapExactEthForTokens()
- swapEthForExactTokens()
- swapTokensForExactTokens()
- swapTokensForExactEth()

## Commission

Calling any of listed above methods also calls **deductCommission()** or **deductEthCommission()** (base on what token is taken as input, named as amountIn in Uniswap).

Commission calculated as follows (for eth):

```solidity
uint256 commission = (msg.value * _commissionInBasisPoints) / 10000;
```

And for tokens:

```solidity
uint256 commission = (amountIn * _commissionInBasisPoints) / 10000;
```

and then transfered to SwapProxy contract (to make approve for following swap) and part of it is sent to **_commissionReceiver**:

```solidity
IERC20(srcToken).safeTransferFrom(msg.sender, address(this), amountIn);
IERC20(srcToken).safeTransfer(_commisionReceiver, commission);
```

### Change commission

**_commissionInBasisPoints** is specified on contract dpeloyment and can be changed via **updateCommissionPercent()** function (can only be called by the contract owner)

```solidity
function updateCommissionPercent(uint256 commissionInBasisPoints_) external onlyOwner {
		uint256 oldCommissionInBasisPoints = _commissionInBasisPoints;
		_commissionInBasisPoints = commissionInBasisPoints_;

		emit CommissionPercentageUpdated(oldCommissionInBasisPoints, _commissionInBasisPoints);
	}
```

Commission is specified in **basis points**, not in percents (to make calculation more precise, despite the absence of floating point numbers in solidity). For example:

1 basis point = 0.01% 

100 basis points = 1%

200 basis points = 2%

1000 basis points = 10%

When the commission changed - the **CommissionPercentageUpdated** event is emited.

### Change commission receiver

**_commissionReceiver** is specified on contract dpeloyment and can be changed via **updateCommissionReceiver()** function (can only be called by the contract owner)

```solidity
function updateCommissionReceiver(uint256 commisionReceiver_) external onlyOwner {
		uint256 oldCommissionReceiver = _commisionReceiver;
		_commisionReceiver = commisionReceiver_;

		emit CommissionReceiverUpdated(oldCommissionReceiver, _commissionReceiver);
}
```

When the commission receiver changed - the **CommissionReceiverUpdated** event is emited.

## Ownable

Contract has owner - the address that has rights to change **_commissionPercentageInBasisPoints** and **_commissionReceiver** properties

To change owner of the contract **transferOwnership** method should be called (can only be called by *current owner*)

```solidity
function transferOwnership(address newOwner) public virtual onlyOwner {
    require(newOwner != address(0), "Ownable: new owner is the zero address");
    _transferOwnership(newOwner);
}
```

## SafeERC20

Uses SafeERC20 library to make transfer safer.