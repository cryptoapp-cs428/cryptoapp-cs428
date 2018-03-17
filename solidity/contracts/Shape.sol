pragma solidity ^0.4.17;

/// @dev The main Animal struct. Every animal is a copy
///  of this structure, so make sure that it fits neatly into
///  256-bit words. The order of the members in this structure
///  is important because of the byte-packing rules used by Ethereum.
///  Ref: http://solidity.readthedocs.io/en/develop/miscellaneous.html
contract CryptoShape {
   /// The owner of this shape
   address public owner;
   /// The matchmaker
   address private baseContract;

   /// The RGB color, stored as RRGGBB.
   /// Allows for 16,777,216 unique shapes.
   uint24 public rgbColor;
   /// The shape's level. Allows for levels 0–255
   uint8 public level = 0;
   /// The shape's experience. Max is 16,777,215
   uint24 public experience = 0;
   uint24 constant MAX_XP = 16777214;

   /// Whether or not this shape is registered for a random fight.
   bool public awaitingRandomFight = false;
   /// Map of addresses of shapes who have sent unresolved challenges to this shape.
   mapping (address => bool) public challengesReceived;
   /// Map of addresses of shapes to whom this shape has sent unresolved challenges.
   mapping (address => bool) public challengesSent;

   function CryptoShape(address shapeOwner, address baseContractAddress) public {
       owner = shapeOwner;
       rgbColor = uint24(random() % 0xFFFFFF);
       baseContract = baseContractAddress;
   }

    function getExperience(uint24 amount) public restricted {
        // Check for overflow
        uint32 newExperience = uint32(amount) + uint32(experience);
        if (newExperience >= MAX_XP) {
            experience = MAX_XP;
        } else {
            experience = uint24(newExperience);
        }
        while (experience >= requiredExperience()) {
            experience -= requiredExperience();
            level++;
        }
    }

   function enterRandom() public restricted {
       awaitingRandomFight = true;
   }

   function leaveRandom() public restricted {
       awaitingRandomFight = false;
   }

   function challenge(address target) public restricted {
       challengesSent[target] = true;
   }

   function challengedBy(address source) public restricted {
       challengesReceived[source] = true;
   }

   function challengeRejectedBy(address target) public restricted {
       challengesSent[target] = false;
   }

   function rejectChallengeBy(address source) public restricted {
       challengesReceived[source] = false;
   }

    modifier restricted() {
        require(msg.sender == baseContract);
        _; // Code for the function is placed here
    }

    function requiredExperience() private view returns (uint24) {
        if (level == 0) {
            return 256;
        } else if (level == 1) {
            return 512;
        } else if (level == 2) {
            return 1024;
        } else if (level == 3) {
            return 4096;
        } else if (level == 4) {
            return 8192;
        } else if (level == 5) {
            return 16384;
        } else if (level == 6) {
            return 32768;
        } else if (level == 7) {
            return 65536;
        } else if (level == 8) {
            return 262144;
        } else if (level == 9) {
            return 1048576;
        } else {
            return MAX_XP + 1;
        }
    }

    function random() private view returns (uint) {
        return uint(sha256(block.difficulty, now, owner, block.number, block.coinbase, msg.data));
    }
}
