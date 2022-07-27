const { expect, assert } = require("chai");
const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer;
          const sendValue = ethers.utils.parseEther("0.05");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function () {
              const transactionResponse1 = await fundMe.fund({
                  value: sendValue,
              });
              await transactionResponse1.wait(1);

              const transactionResponse2 = await fundMe.cheaperWithdraw();
              await transactionResponse2.wait(1);

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );

              assert.equal(endingBalance.toString(), "0");
          });
      });
