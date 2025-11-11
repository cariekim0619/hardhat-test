import hre from "hardhat"
import { NativeBank } from "../typechain-types"
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers"
import { expect } from "chai";

describe("NativeBank", () => {
    let signers:HardhatEthersSigner[];
    let nativeBankC:NativeBank;

    beforeEach("Deploy NativeBank contract", async () => {
        signers = await hre.ethers.getSigners();
        nativeBankC = await hre.ethers.deployContract("NativeBank");
    });

    it("Should send native token to contract", async () => {
        const staker = signers[0];
        const tx = {
            from: staker.address,
            to: await nativeBankC.getAddress(),
            value: hre.ethers.parseEther("1"),
        };
        const txResp = await staker.sendTransaction(tx);
        await txResp.wait();
        await nativeBankC.balanceOf(staker.address);
    });

    it("Should withdraw all the tokens", async () => {
        const staker = signers[0];
        const stakingAmout = hre.ethers.parseEther("10");
        const tx = {
            from: staker.address,
            to: await nativeBankC.getAddress(),
            value: stakingAmout
        }
        const sendTx = await staker.sendTransaction(tx);
        await sendTx.wait();
        expect(await nativeBankC.balanceOf(staker.address)).equal(stakingAmout);
        await nativeBankC.withdraw();
        expect(await nativeBankC.balanceOf(staker.address)).equal(0n);
    })
});
