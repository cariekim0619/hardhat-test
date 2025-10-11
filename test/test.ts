import hre, { ethers } from "hardhat";

describe("hardhat-test", () => {
  it("hardhat ethers test", async () => {
    // const myFirstWallet = hre.ethers.Wallet.createRandom();
    const signers = await hre.ethers.getSigners();

    const bobWallet = signers[0];
    const aliceWallet = signers[1];
    const tx = {
        from:bobWallet.address,
        to:aliceWallet.address,
        value:hre.ethers.parseEther("100"),
    };
    // console.log(signers);
    // console.log(signers.length);
    const txHash = await bobWallet.sendTransaction(tx);
    const receipt = txHash.wait();
    // console.log(hre.ethers.provider.getTransaction(txHash.hash));
    // console.log("-----");
    // console.log(receipt);
  });
  
  it("ethers test", async () => {
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");

    const bobWallet = new ethers.Wallet(
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        provider
    );
    const aliceWallet = new ethers.Wallet("0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
    
    const tx = {
        from:bobWallet.address,
        to:aliceWallet.address,
        value:ethers.parseEther("100"),
        chainId:31337,
    };
    const populatedTx = await bobWallet.populateTransaction(tx);
    const signedTx = await bobWallet.signTransaction(populatedTx);
    const txHash = await provider.send("eth_sendRawTransaction", [signedTx]);
    
    console.log(
        ethers.formatEther(await provider.getBalance(aliceWallet.address))
    );
    console.log(
        ethers.formatEther(await provider.getBalance(bobWallet.address))
    );
});
});