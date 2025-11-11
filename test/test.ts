import hre from "hardhat"
import { expect } from "chai"
import { MyToken } from "../typechain-types"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"

const mintingAmount = 100n;
const decimals = 18n;

describe("mytoken deploy", () => {
    let myTokenC:MyToken;
    let signers:HardhatEthersSigner[];

    beforeEach("should deploy", async () => {
        signers = await hre.ethers.getSigners();
        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            decimals,
            mintingAmount,
        ]);
    });

    describe("Approve & TransferFrom", () => {
        it("should approve signer1 to spend signer0's 10 MT", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];

            await expect(myTokenC.connect(signer0).approve(signer1.address,hre.ethers.parseUnits("10", Number(decimals)))).to.emit(myTokenC, "Approval").withArgs(signer1.address, hre.ethers.parseUnits("10", Number(decimals)));
        });

        it("should allow signer1 to transferFrom signer0 to signer1", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            const amount = hre.ethers.parseUnits("10", Number(decimals));

            await myTokenC.connect(signer0).approve(signer1.address, amount);

            await expect(myTokenC.connect(signer1).transferFrom(signer0.address, signer1.address, amount)).to.emit(myTokenC, "Transfer").withArgs(signer0.address, signer1.address, amount);

            const balance0 = await myTokenC.balanceOf(signer0.address);
            const balance1 = await myTokenC.balanceOf(signer1.address);

            // console.log("signer0 balance:", balance0.toString());
            // console.log("signer1 balance:", balance1.toString());

            expect(balance1).equal(amount);
            expect(balance0).equal(hre.ethers.parseUnits(mintingAmount.toString(), Number(decimals)) - amount);
        });

        it("should be reverted if allowance insufficient", async () => {
            const signer0 = signers[0];
            const signer1 = signers[1];
            const amount = hre.ethers.parseUnits("10", Number(decimals));

            await myTokenC.connect(signer0).approve(signer1.address, amount);
            await myTokenC.connect(signer1).transferFrom(signer0.address, signer1.address, amount);

            await expect(myTokenC.connect(signer1).transferFrom(signer0.address, signer1.address, amount)).to.be.revertedWith("insufficient allowance");
        });
    });
});
