import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
    let signers: HardhatEthersSigner[];
    let myTokenC: MyToken;
    let tinyBankC: TinyBank;

    beforeEach(async () => {
        signers = await hre.ethers.getSigners();

        myTokenC = await hre.ethers.deployContract("MyToken", [
            "MyToken",
            "MT",
            DECIMALS,
            MINTING_AMOUNT,
        ]);

        const managers = [signers[0].address, signers[1].address, signers[2].address];
        tinyBankC = await hre.ethers.deployContract("TinyBank", [
            await myTokenC.getAddress(),
            managers,
            managers.length
        ]);

        await myTokenC.setManager(await tinyBankC.getAddress());
    });

    describe("Initialized state check", () => {
        it("should return totalStaked 0", async () => {
            expect(await tinyBankC.totalStaked()).to.equal(0);
        });
        it("should return staked 0 amount of signer0", async () => {
            const signer0 = signers[0];
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    });

    describe("Staking", () => {
        it("should return staked amount", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
            expect(await tinyBankC.totalStaked()).equal(stakingAmount);
            expect(await myTokenC.balanceOf(await tinyBankC.getAddress())).equal(await tinyBankC.totalStaked());
        });
    });

    describe("Withdraw", () => {
        it("should return 0 staked after withdrawing total token", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);
            await tinyBankC.withdraw(stakingAmount);
            expect(await tinyBankC.staked(signer0.address)).equal(0);
        });
    });

    describe("Multi Manager", () => {
        it("reverts confirm by non-manager with exact message", async () => {
            const hacker = signers[4];
            await expect(tinyBankC.connect(hacker).confirm()).to.be.revertedWith("You are not a manager");
        });

        it("reverts setRewardPerBlock until all managers confirm", async () => {
            const newAmount = hre.ethers.parseUnits("2", DECIMALS);
            await expect(tinyBankC.setRewardPerBlock(newAmount)).to.be.revertedWith("Not all confirmed yet");
        });

        it("allows setRewardPerBlock after all managers confirm", async () => {
            await tinyBankC.connect(signers[0]).confirm();
            await tinyBankC.connect(signers[1]).confirm();
            await tinyBankC.connect(signers[2]).confirm();

            const newAmount = hre.ethers.parseUnits("2", DECIMALS);
            await tinyBankC.setRewardPerBlock(newAmount);
            expect(await tinyBankC.rewardPerBlock()).equal(newAmount);
        });
    });

    describe("reward", () => {
        it ("rewards per block on withdraw", async () => {
            const signer0 = signers[0];
            const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
            await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
            await tinyBankC.stake(stakingAmount);

            const BLOCKS = 5n;
            const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
            for (let i = 0n; i < BLOCKS; i++) {
                await myTokenC.transfer(transferAmount, signer0.address);
            }

            await tinyBankC.withdraw(stakingAmount);
            const expected = hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString(), DECIMALS);
            expect(await myTokenC.balanceOf(signer0.address)).equal(expected);
        });
    });
});