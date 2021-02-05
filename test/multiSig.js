const MultiSig = artifacts.require("MultiSig");

contract("MultiSig", (accounts) => {
  let multiSig = null;
  before(async () => {
    multiSig = await MultiSig.deployed();
  });
});
