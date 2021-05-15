// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "./ABDKMathQuad.sol";

contract TokenSale is Ownable {
  struct Round {
    uint startBlock;
    uint saleAmount;
    uint endBlock;
    Entry[] entries;
    uint totalQuantity;
  }

  struct Entry {
    address buyer;
    uint quantity;
  }

  ERC20PresetMinterPauser private _token;
  address payable private _owner;

  mapping (uint => Round) public rounds;
  uint public round;
  uint private prv;
  uint public duration;
  uint private _saleAmount = 101000000;
  uint8 private DECIMALS = 18;
  mapping (address => uint) public balances;

  event DepoistForBuy (address from, uint quantity);
  event RewardToken (address to, uint quantity);

  constructor (ERC20PresetMinterPauser token, address payable owner) {
    _token = token;
    _owner = owner;
  }

  // duration is in blocks. 1 day = ~6500 block
  function setRound (uint _duration) public onlyOwner {
    duration = _duration;
    round = 1;
    rounds[round].startBlock = block.number;
    rounds[round].endBlock = block.number + duration;
    rounds[round].saleAmount = _saleAmount * (10 ** uint(DECIMALS));
  }

  function buy () payable public {
    require(msg.value > 0);
    require(round <= 101);

    if (block.number > rounds[round].endBlock) {
      prv = round;
      round += 1;
      rounds[round].startBlock = block.number;
      rounds[round].endBlock = block.number + duration;
      
      if (round == 101) {
        rounds[round].saleAmount = 1010000 * (10 ** uint(DECIMALS));
      } else {
        rounds[round].saleAmount = rounds[prv].saleAmount - (1000000 * (10 ** uint(DECIMALS)));
      }
    }

    uint quantity = msg.value;
    Entry memory entry = Entry(msg.sender, quantity);
    rounds[round].entries.push(entry);
    rounds[round].totalQuantity += quantity;

    _owner.transfer(quantity);

    emit DepoistForBuy(msg.sender, quantity);
  }

  function rewardToken (uint roundNumber) public onlyOwner {
    Round storage sold = rounds[roundNumber];
    require(block.number > sold.endBlock);
    require(sold.entries.length > 0);

    for (uint i = 0; i < sold.entries.length; i++) {
      uint quantity = sold.entries[i].quantity;
      uint reward = mulDiv(sold.saleAmount, quantity, sold.totalQuantity);

      balances[sold.entries[i].buyer] += reward;
    }
  }

  function withdraw () public {
    require(balances[msg.sender] > 0);
    uint amount = balances[msg.sender];
    
    _token.mint(msg.sender, amount);

    balances[msg.sender] = 0;

    emit RewardToken(msg.sender, amount);
  }

  function mulDiv (uint x, uint y, uint z) private pure returns (uint) {
    return
      ABDKMathQuad.toUInt (
        ABDKMathQuad.div (
          ABDKMathQuad.mul (
            ABDKMathQuad.fromUInt (x),
            ABDKMathQuad.fromUInt (y)
          ),
          ABDKMathQuad.fromUInt (z)
        )
      );
  }

  receive () payable external {
    buy();
  }
}