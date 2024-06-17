// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./TwitterVerifier.sol";
import "@zk-email/contracts/DKIMRegistry.sol";
import "@zk-email/contracts/utils/StringUtils.sol";

contract IdentityGraph {
    
    struct Identity {
        string domain;
        string userID;
    }

    bytes public avatar;
    uint8 public constant pubkeyHashIndexInSignals = 0;
    uint8 public constant usernameIndexInSignals = 1;
    uint8 public constant addressIndexInSignals = 2; 
    uint8 public constant usernameLengthInSignals = 1;
    uint16 public constant bytesInPackedBytes = 31;

    mapping(string => bytes32[]) public idByDomain;
    mapping(bytes32 => Identity) public identityDetail;

    DKIMRegistry dkimRegistry;
    Groth16Verifier public immutable verifier;

    error AddressMismatch(address _committedAddr, address _msgSender);
    error InvalidDKIMSignature(string _domain, bytes32 _pubkeyHashInCircuit);

    event IdentityBinding(bytes32 indexed identityHash, string indexed domain, string userId);

    constructor(bytes memory _avatar, Groth16Verifier _v, DKIMRegistry _d){
        avatar = _avatar;
        dkimRegistry = _d;
        verifier = _v;
    }

    /**
     * 
     * @param _domain identity platform domain
     * @param _proof zk proof of the circuit - a[2], b[4] and c[2] encoded in series
     * @param _signals public signal of the circuits: 
     *      1st - pubkeyHash 2nd - twitter username, 3rd - ethereum address
     */
    function bindIdentity(string memory _domain, uint256[8] memory _proof, uint256[3] memory _signals) external {
        //TODO: no invalid signal check yet

        // public signals are the masked packed message bytes, and hash of public key.abi

        // Better check eth address committed to in proof matches `msg.sender`, to avoid replayability
        // --------------- UNCOMMENT TO ENABLE ADDRESS CHECK ---------------
        // address committedAddr = address(uint160(_signals[addressIndexInSignals]));
        // require(committedAddr == msg.sender, AddressMismatch(committedAddr, msg.sender));

        bytes32 dkimPublickeyHashInCircuit = bytes32(_signals[pubkeyHashIndexInSignals]);
        require(dkimRegistry.isDKIMPublicKeyHashValid(_domain, dkimPublickeyHashInCircuit), InvalidDKIMSignature(_domain, dkimPublickeyHashInCircuit));

        // Verify RSA and proof
        require(
            verifier.verifyProof(
                [_proof[0], _proof[1]],
                [[_proof[2], _proof[3]], [_proof[4], _proof[5]]],
                [_proof[6],_proof[7]],
                _signals
            ),
            "Invalid zk proof"
        );

        //Extract username from the signals
        uint256[] memory usernamePack = new uint256[](usernameLengthInSignals);
        for (uint256 i = usernameIndexInSignals; i < (usernameIndexInSignals + usernameLengthInSignals); i++){
            usernamePack[i - usernameIndexInSignals] = _signals[i];
        }

        // Convert username chunks to username string
        string memory messageBytes = StringUtils.convertPackedBytesToString(
            usernamePack,
            bytesInPackedBytes * usernameLengthInSignals,
            bytesInPackedBytes
        );

        bytes32 identityHash = keccak256(abi.encodePacked(_domain, messageBytes));
        idByDomain[_domain].push(identityHash);
        identityDetail[identityHash] = Identity({domain: _domain, userID: messageBytes});

        emit IdentityBinding(identityHash, _domain, messageBytes);
    }

}