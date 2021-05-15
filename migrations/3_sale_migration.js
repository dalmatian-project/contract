const DMTN = artifacts.require("DMTN");
const TokenSale = artifacts.require("TokenSale");

module.exports = async function (deployer, network, addresses) {
  await deployer.deploy(DMTN);
  const dmtnToken = await DMTN.deployed();
  const tokenAddress = dmtnToken.address;

  await deployer.deploy(TokenSale, tokenAddress, addresses[0]);
}