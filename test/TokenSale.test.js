const DMTN = artifacts.require("DMTN");
const TokenSale = artifacts.require("TokenSale");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');
const { expect, assert } = require('chai');

contract('TokenSale', accounts => {
  let dmtn;
  let tokenSale;

  const owner = accounts[0];
  const firstBuyer = accounts[1];
  const secondBuyer = accounts[2];
  const thirdBuyer = accounts[3];
  const forthBuyer = accounts[4];
  const fifthBuyer = accounts[5];
  const sixthBuyer = accounts[6];
  const DURATION = 5;
  const BUYER_DEPOSIT = 1;
  
  before(async function() {
    dmtn = await DMTN.new({ from: owner });
    tokenSale = await TokenSale.new(dmtn.address, owner);
    await dmtn.setupRole(tokenSale.address, { from: owner });
  })

  it('setRound', async function() {
    await tokenSale.setRound(DURATION);
    const round = await tokenSale.round();
    const duration = await tokenSale.duration();

    expect(round.toNumber()).to.eq(1);
    expect(duration.toNumber()).to.eq(DURATION);

    const ownerEth = await web3.eth.getBalance(owner);
    initialBalance = web3.utils.fromWei(ownerEth, 'ether');
  })

  it('first deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 1}`, 'ether');
    const tx = await tokenSale.buy({ from: firstBuyer, value: depoist });
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(firstBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('second deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 2}`, 'ether');
    const tx = await tokenSale.buy({ from: secondBuyer, value: depoist });
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(secondBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('third deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 3}`, 'ether');
    const tx = await tokenSale.buy({ from: thirdBuyer, value: depoist })
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(thirdBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('forth deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 4}`, 'ether');
    const tx = await tokenSale.buy({ from: forthBuyer, value: depoist })
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(forthBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('fifth deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 5}`, 'ether');
    const tx = await tokenSale.buy({ from: fifthBuyer, value: depoist })
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(fifthBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('sixth deposit', async function() {
    const depoist = web3.utils.toWei(`${BUYER_DEPOSIT * 6}`, 'ether');
    const tx = await tokenSale.buy({ from: sixthBuyer, value: depoist })
    
    assert.equal(tx.logs[0].event, 'DepoistForBuy');
    expect(tx.logs[0].args[0]).to.eq(sixthBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(depoist);
  })

  it('first round ended, reward token', async function() {
    await tokenSale.rewardToken(1);
    const endRound = await tokenSale.rounds(1);

    const deposit = web3.utils.fromWei(endRound.totalQuantity.toString(), 'ether');
    
    const firstBuyerBalance = await tokenSale.balances(firstBuyer);
    const secondBuyerBalance = await tokenSale.balances(secondBuyer);
    const thirdBuyerBalance = await tokenSale.balances(thirdBuyer);
    const forthBuyerBalance = await tokenSale.balances(forthBuyer);
    const fifthBuyerBalance = await tokenSale.balances(fifthBuyer);

    console.log()

    expect(web3.utils.fromWei(firstBuyerBalance.toString())).to.eq('6733333.333333333333333333');
    expect(web3.utils.fromWei(secondBuyerBalance.toString())).to.eq('13466666.666666666666666666');
    expect(web3.utils.fromWei(thirdBuyerBalance.toString())).to.eq('20200000');
    expect(web3.utils.fromWei(forthBuyerBalance.toString())).to.eq('26933333.333333333333333333');
    expect(web3.utils.fromWei(fifthBuyerBalance.toString())).to.eq('33666666.666666666666666666');
    expect(Number(deposit)).to.eq(15);
  })

  it('withdraw', async function() {
    const tx = await tokenSale.withdraw({ from: firstBuyer });
    const firstBuyerDMTN = await dmtn.balanceOf(firstBuyer);

    assert.equal(tx.logs[0].event, 'RewardToken');
    expect(tx.logs[0].args[0]).to.eq(firstBuyer);
    expect(tx.logs[0].args[1].toString()).to.eq(firstBuyerDMTN.toString());
    expect(web3.utils.fromWei(firstBuyerDMTN.toString())).to.eq('6733333.333333333333333333');
  })
})