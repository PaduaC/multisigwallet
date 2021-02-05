const MultiSig = artifacts.require("MultiSig");
const { expectRevert } = require("@openzeppelin/test-helpers");

contract("MultiSig", (accounts) => {
  let multiSig = null;
  before(async () => {
    multiSig = await MultiSig.deployed();
  });

  it("should create transfer", async () => {
    await multiSig.createTransfer(1000, accounts[4], { from: accounts[0] });
    const transfer = await multiSig.transfers(0);
    assert(transfer.id.toNumber() === 0);
    assert(transfer.amount.toNumber() === 1000);
  });

  it("should NOT create transfer", async () => {
    await expectRevert(
      multiSig.createTransfer(1000, accounts[4], { from: accounts[5] }),
      "Only approver allowed"
    );
  });

  it("should NOT send transfer if quorum is not met", async () => {
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(accounts[5])
    );
    await multiSig.createTransfer(1000, accounts[5], { from: accounts[0] });
    await multiSig.sendTransfer(1, { from: accounts[1] });
    const balanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(accounts[5])
    );
    assert(balanceAfter.sub(balanceBefore).isZero());
  });

  it("should send transfer if quorum is met", async () => {
    const balanceBefore = web3.utils.toBN(
      await web3.eth.getBalance(accounts[6])
    );
    await multiSig.createTransfer(1000, accounts[6], { from: accounts[0] });
    await multiSig.sendTransfer(2, { from: accounts[1] });
    await multiSig.sendTransfer(2, { from: accounts[2] });
    const balanceAfter = web3.utils.toBN(
      await web3.eth.getBalance(accounts[6])
    );
    assert(balanceAfter.sub(balanceBefore).toNumber() === 1000);
  });
});
