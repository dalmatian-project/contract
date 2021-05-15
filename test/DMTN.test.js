const DMTN = artifacts.require("DMTN");
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect, assert } = require('chai');

contract('DMTN', accounts => {
  let dmtn;

  const owner = accounts[0];
  const spender = accounts[1];
  const REWARD_AMOUNT = 5151010000;
  const TRANSFER_AMOUNT = 1000;
  const MAX = Number.MAX_SAFE_INTEGER;

  before(async function() {
    dmtn = await DMTN.new({ from: owner });
  })

  it('zero supply deployed', async function() {
    const initialSupply = await dmtn.totalSupply();
    expect(initialSupply.toNumber()).to.eq(0)
  });

  it('mint reward Amount', async function() {
    const mintAmount = new BN(REWARD_AMOUNT);
    await dmtn.mint(owner, mintAmount);

    const rewardSupply = await dmtn.totalSupply();
    const ownerBalance = await dmtn.balanceOf(owner);

    expect(rewardSupply.toNumber()).to.eq(ownerBalance.toNumber());
    expect(rewardSupply.toNumber()).to.eq(REWARD_AMOUNT);
    expect(ownerBalance.toNumber()).to.eq(REWARD_AMOUNT);
  });

  it('approve', async function() {
    const tx = await dmtn.approve(spender, TRANSFER_AMOUNT);
    const allowance = await dmtn.allowance(owner, spender);

    expect(allowance.toNumber()).to.eq(TRANSFER_AMOUNT);
    assert.equal(tx.logs[0].event, 'Approval');
  });

  it('transfer', async function() {
    const transferAmount = new BN(TRANSFER_AMOUNT);
    const tx = await dmtn.transfer(spender, transferAmount, { from: owner });

    const ownerBalance = await dmtn.balanceOf(owner);
    const spenderBalance = await dmtn.balanceOf(spender);

    const rest = REWARD_AMOUNT - TRANSFER_AMOUNT;
    
    expect(ownerBalance.toNumber()).to.eq(rest);
    expect(spenderBalance.toNumber()).to.eq(TRANSFER_AMOUNT);

    const totalSupply = await dmtn.totalSupply();

    expect(totalSupply.toNumber()).to.eq(REWARD_AMOUNT);
    assert.equal(tx.logs[0].event, 'Transfer');
  });

  it('transfer:fail', async function() {
    const OVER_AMOUNT = REWARD_AMOUNT + 1;
    const overAmount = new BN(OVER_AMOUNT);

    await expectRevert(dmtn.transfer(spender, overAmount), 'transfer amount exceeds balance');
    await expectRevert(dmtn.transfer(owner, overAmount, { from: spender }), 'transfer amount exceeds balance');
  });

  it('transferFrom', async function() {
    const transferAmount = new BN(TRANSFER_AMOUNT);

    await dmtn.approve(spender, transferAmount);
    const tx = await dmtn.transferFrom(owner, spender, transferAmount, { from: spender });
    const allowance = await dmtn.allowance(owner, spender);

    const ownerBalance = await dmtn.balanceOf(owner);
    const spenderBalance = await dmtn.balanceOf(spender);

    const spenderRest = TRANSFER_AMOUNT * 2;
    const rest = REWARD_AMOUNT - spenderRest;

    assert.equal(tx.logs[0].event, 'Transfer');
    expect(tx.logs[0].args[0]).to.eq(owner);
    expect(tx.logs[0].args[1]).to.eq(spender);
    expect(tx.logs[0].args[2].toNumber()).to.eq(TRANSFER_AMOUNT);
    expect(allowance.toNumber()).to.eq(0);
    expect(ownerBalance.toNumber()).to.eq(rest);
    expect(spenderBalance.toNumber()).to.eq(spenderRest);
  });

  it('transferFrom:max', async function() {
    const transferAmount = new BN(TRANSFER_AMOUNT);
    const maxNumber = new BN(MAX);

    await dmtn.approve(spender, maxNumber);
    const tx = await dmtn.transferFrom(owner, spender, transferAmount, { from: spender });
    const allowance = await dmtn.allowance(owner, spender);

    const ownerBalance = await dmtn.balanceOf(owner);
    const spenderBalance = await dmtn.balanceOf(spender);

    const spenderRest = TRANSFER_AMOUNT * 3;
    const rest = REWARD_AMOUNT - spenderRest;
    const approvalRest = MAX - TRANSFER_AMOUNT;

    assert.equal(tx.logs[0].event, 'Transfer');
    expect(tx.logs[0].args[0]).to.eq(owner);
    expect(tx.logs[0].args[1]).to.eq(spender);
    expect(tx.logs[0].args[2].toNumber()).to.eq(TRANSFER_AMOUNT);
    expect(allowance.toNumber()).to.eq(approvalRest);
    expect(ownerBalance.toNumber()).to.eq(rest);
    expect(spenderBalance.toNumber()).to.eq(spenderRest);
  });
})