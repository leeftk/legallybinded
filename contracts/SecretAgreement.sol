pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

error YouAreNotPartOfParty();
error AgreementAlreadyExists();
error AgreementHasNotBeenAccepted();
error InvalidSignature();
error InvalidSecret();


contract SecretAgreement {
    
    using ECDSA for bytes32;

    struct Agreement {
        address party1;
        address party2;
        bool isParty1Voted;
        bool isParty2Voted;
    }

    mapping(bytes32 => Agreement) public agreements;

    event SecretRevealed(address indexed revealer, string secret);

    /// @dev Creates a new agreement with the provided secret hash and the second party's address.
    /// @param _secretHash The hash of the secret agreed upon by the parties.
    /// @param _party2 The address of the second party involved in the agreement.

    function createAgreement(bytes32 _secretHash, address _party2) external {
        Agreement storage agreement = agreements[_secretHash];
        require(agreement.party1 == address(0), "Agreement already exists for the secret hash.");
        agreement.party1 = msg.sender;
        agreement.party2 = _party2;
        agreement.isParty1Voted = false;
        agreement.isParty2Voted = false;
        agreements[_secretHash] = agreement;
    }

    function agreeToSecret(bytes32 _secretHash) external {
        if(msg.sender != agreements[_secretHash].party1 && msg.sender != agreements[_secretHash].party2) revert YouAreNotPartOfParty();
        if(msg.sender == agreements[_secretHash].party1){
        agreements[_secretHash].isParty1Voted = true;
        }
        else if(msg.sender == agreements[_secretHash].party2){
        agreements[_secretHash].isParty2Voted = true;
        }

    }
    /// @dev Reveals the secret associated with the given hash, provided the conditions are met.
    /// @param _secretHash The secret to be revealed.
    /// @param _secretToReveal The secret to be revealed.
    /// @param _signature The signature of the message hash to verify the authenticity of the revealer.

    function revealSecret(bytes32 _secretHash, string memory _secretToReveal, bytes memory _signature) external {
        bytes32 secretSig = _secretHash.toEthSignedMessageHash();
        bytes32 secretHash = keccak256(abi.encodePacked(_secretToReveal));

        if(msg.sender != agreements[_secretHash].party1 && msg.sender != agreements[_secretHash].party2) revert YouAreNotPartOfParty();
        require(agreements[_secretHash].isParty1Voted == true && agreements[_secretHash].isParty2Voted == true, "Both parties have not agreed to the secret");
        require(_verifySignature(secretSig, _signature), "Invalid signature.");
        require(_secretHash == secretHash, "Invalid secret.");


        emit SecretRevealed(msg.sender, _secretToReveal);

        delete agreements[_secretHash];
    }

    /// @dev Verifies the signature of a message hash.
    /// @param _messageHash The hash of the message that was signed.
    /// @param _signature The signature to be verified.
    /// @return A boolean indicating whether the signature is valid or not.

    function _verifySignature(bytes32 _messageHash, bytes memory _signature) internal view returns (bool) {
        address recoveredSigner = _messageHash.recover(_signature);
        return recoveredSigner == msg.sender;
    }
}
