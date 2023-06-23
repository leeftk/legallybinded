const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SecretAgreement", function () {
  let secretAgreement;
  let signer1;
  let signer2;
  let signer3;

  beforeEach(async function () {
    const SecretAgreement = await ethers.getContractFactory("SecretAgreement");
    [signer1, signer2, signer3] = await ethers.getSigners();
    secretAgreement = await SecretAgreement.deploy();
    await secretAgreement.waitForDeployment();
  });

  describe("Create Agreement", function () {

  it("should allow two parties to create an agreement and reveal the secret", async function () {
    const secretHash = ethers.keccak256(ethers.toUtf8Bytes("Secret Message"));
    // Party 1 creates the agreement
    await secretAgreement.connect(signer1).createAgreement(secretHash, signer2.address);

    // Party 1 & 2 agrees to the secret
    await secretAgreement.connect(signer1).agreeToSecret(secretHash);
    await secretAgreement.connect(signer2).agreeToSecret(secretHash);
    
    // Party 2 reveals the secret
    const signature = await signMessage(secretHash, signer2);
    await secretAgreement.connect(signer2).revealSecret(secretHash, "Secret Message", signature);
  
    // Check if the secret has been revealed and agreement is deleted
    const agreement = await secretAgreement.connect(signer1).agreements(secretHash);
    
    //expect(agreement.isSecretRevealed).to.be.true;
    expect(agreement.party1).to.equal("0x0000000000000000000000000000000000000000");
    //find the logs of the event for the secret revealed
    const agreementRevealedEvent = await secretAgreement.queryFilter(
      secretAgreement.filters.SecretRevealed()
    );
    expect(agreementRevealedEvent[0].args.secret).to.equal("Secret Message");
  });
});

it("should revert if the agreement already exists", async function () {

  //Create unique secret hash
  const secretHash = ethers.keccak256(ethers.toUtf8Bytes("BLAHHHHHH"));

  // Party 1 creates the agreement
  await secretAgreement.connect(signer3).createAgreement(secretHash, signer2.address);

  // Party 1 tries to create the agreement again
  await expect(secretAgreement.connect(signer3).createAgreement(secretHash, signer2.address)).to.be.revertedWithCustomError;

});

  it("should prevent an unauthorized party from revealing the secret", async function () {
    const secretHash = ethers.keccak256(ethers.toUtf8Bytes("Secret Message"));

    // Party 1 creates the agreement
    await secretAgreement.createAgreement(secretHash, signer2.address);

    // Unauthorized party tries to reveal the secret
    const signature = await signMessage(secretHash, signer1);
    await expect(secretAgreement.connect(signer3).revealSecret(secretHash,"bye friend", signature)).to.be.revertedWithCustomError;
  });


    it("Should agree to secret", async function () {
      const secretHash = ethers.keccak256(ethers.toUtf8Bytes("Secret Message"));
  
      // Party 1 creates the agreement
      await secretAgreement.connect(signer1).createAgreement(secretHash, signer2.address);
  
      // Party 2 agrees to the secret
      await secretAgreement.connect(signer1).agreeToSecret(secretHash);
      await secretAgreement.connect(signer2).agreeToSecret(secretHash);
  
      // Check if the agreement has been updated
      const agreement = await secretAgreement.agreements(secretHash);
      expect(agreement.party2).to.equal(signer2.address);
      expect(agreement.party1).to.equal(signer1.address);
      expect(agreement.isParty1Voted).to.be.true;
    });

  async function signMessage(message, signer) {
    const messageBytes = ethers.getBytes(message);
    const signature = await signer.signMessage(messageBytes);
    return signature;
  }
});
