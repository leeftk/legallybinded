# Techinical Overview and Design

## Techinical Specs and Requirements
- Implement three core function 
  - `createAgreement()`
    - Create agreement will create a new agreement
    - It will have to parameters the keccak256 hash of the secret and the address of the second party in the agreement.
    - It will require that the agreement doesn't already exist
    - It will set the first part to the msg.sender the second to the address that was passed
    - It will set the isVoted false for both party 1 and 2

  - `agreeToSecret()`
    - Will allow both parties to agree to secret
    - Will require that the msg.sender is one of the parties
    - Will vote on the secret based on who is calling the function
  - `revealSecret()`
    - Will verify that the secret passed is the same one as being stored
    - Will verify that the secret as been voted on by both parties
    - Will verify the signature that is being passed
    - Will require that the person calling the function is one of the voters

## Testing Coverage


File                  |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------|----------|----------|----------|----------|----------------|
 contracts           |      100 |     87.5 |      100 |      100 |                |
  SecretAgreement.sol |      100 |     87.5 |      100 |      100 |                |
||||||
All files             |      100 |     87.5 |      100 |      100 |                |
||||||

### Design choices and future implementations

The design choice for this implementation focuses on optimizing data storage and verification processes. The key approach involves utilizing a struct to store all the necessary agreement data, which is referenced using the hash of the secret. This design allows for efficient data retrieval with only one lookup required to check if the agreement has been accepted by both parties.

Storing the hash on-chain instead of the actual secret data offers several advantages. Firstly, it reduces the storage requirements, as only the hash needs to be stored. Secondly, it enhances security by keeping the secret confidential on-chain. When the secret is revealed, the user must provide the actual secret as an argument to the function.

To ensure the integrity of the revealed secret, the function hashes the provided secret and compares it with the stored hash. This verification step guarantees that the revealed secret matches the original agreed-upon secret.

By employing this design approach, the implementation achieves a balance between data efficiency and security, enabling secure and streamlined handling of secret agreements within the smart contract.



## Slither Results
```
Parameter SecretAgreement.createAgreement(bytes32,address)._secretHash (contracts/SecretAgreement.sol#32) is not in mixedCase
Parameter SecretAgreement.createAgreement(bytes32,address)._party2 (contracts/SecretAgreement.sol#32) is not in mixedCase
Parameter SecretAgreement.agreeToSecret(bytes32)._secretHash (contracts/SecretAgreement.sol#42) is not in mixedCase
Parameter SecretAgreement.revealSecret(bytes32,string,bytes)._secretHash (contracts/SecretAgreement.sol#57) is not in mixedCase
Parameter SecretAgreement.revealSecret(bytes32,string,bytes)._secretToReveal (contracts/SecretAgreement.sol#57) is not in mixedCase
Parameter SecretAgreement.revealSecret(bytes32,string,bytes)._signature (contracts/SecretAgreement.sol#57) is not in mixedCase
Contract console (node_modules/hardhat/console.sol#4-1532) is not in CapWords
Reference: https://github.com/crytic/slither/wiki/Detector-Documentation#conformance-to-solidity-naming-conventions
```

