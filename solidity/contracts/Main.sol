pragma solidity ^0.4.21;

/// @title Base contract for CryptoShapes. Manages CryptoShape creation and battles.
contract CryptoShapeMain {

    /*** EVENTS ***/
    event ShapeAdded(address shapeAddress, address owner);
    event ChallengePosted(address sourceShape, address targetShape);
    event ChallengeResolved(address sourceShape, address targetShape, bool sourceWon);
    event ChallengeRejected(address sourceShape, address targetShape);
    event RandomPosted(address shapeAddress);
    event RandomResolved(address winnerShapeAddress, address loserShapeAddress);

    /*** DATA TYPES ***/


    /*** CONSTANTS ***/
    /// @dev The price to purchase a new CryptoShape
    uint shapePrice = 0.01 ether;
    uint randomFightCost = 0.0001 ether;
    uint sendChallengeCost = 0.00015 ether;
    uint acceptChallengeCost = 0.00005 ether;

    /*** STORAGE ***/
    /// @dev A mapping from shape address to (exists)
    mapping (address => bool) public shapeMap;
    /// @dev A list of all the shapes that exist
    address[] shapes;
    address public manager;

    /*** API ***/

    function CryptoShapeMain() public {
        manager = msg.sender;
    }

    /// @dev Create a new shape and assign it to be owned by the purchaser.
    function buyShape() public payable {
        require(msg.value == shapePrice);
        address newShape = new CryptoShape(msg.sender, this);
        shapes.push(newShape);
        shapeMap[newShape] = true;
        emit ShapeAdded(newShape, msg.sender);
    }

    /// @dev Get the list of all shapes in the blockchain.
    /// Returning a dynamic array works only externally (send/transaction calls).
    /// Do not call this function from inside solidity.
    function getShapes() public view returns (address[])  {
        return shapes;
    }

    function enterRandomFightPool(address shapeAddress) public payable {
        require(msg.value == randomFightCost); // Pay the right amount
        require(shapeMap[shapeAddress]); // Shape exists
        CryptoShape shape = CryptoShape(shapeAddress);
        require(shape.owner() == msg.sender); // Owner of shape is doing it
        require(!shape.awaitingRandomFight()); // Shape isn't already registered for random
        shape.enterRandom();
        emit RandomPosted(shapeAddress);
    }

    function resolveRandomFight(address shape1, address shape2) public restricted {
        CryptoShape s1 = CryptoShape(shape1);
        CryptoShape s2 = CryptoShape(shape2);
        require(s1.awaitingRandomFight());
        require(s2.awaitingRandomFight());

        s1.leaveRandom();
        s2.leaveRandom();

        bool s1Won = resolveFight(s1, s2);
        if (s1Won) {
            s1.getExperience(experienceForWin(s1.level(), s2.level()));
            s2.getExperience(experienceForLoss());
            emit RandomResolved(shape1, shape2);
        } else {
            s2.getExperience(experienceForWin(s2.level(), s1.level()));
            s1.getExperience(experienceForLoss());
            emit RandomResolved(shape2, shape1);
        }
    }

    function issueChallenge(address source, address target) public payable {
        require(msg.value == sendChallengeCost); // Pay the right amount
        require(shapeMap[source]); // Source exists
        require(shapeMap[target]); // Target exists
        CryptoShape sourceShape = CryptoShape(source);
        CryptoShape targetShape = CryptoShape(target);
        require(sourceShape.owner() == msg.sender); // Source is owned by sender
        require(targetShape.owner() != msg.sender); // Target is not owned by sender
        require(sourceShape.challengesSent(target) == false); // Source does not have a pending challenge to target
        require(targetShape.challengesReceived(source) == false); // Target does not have a pending challenge from source

        sourceShape.challenge(target);
        targetShape.challengedBy(source);

        emit ChallengePosted(source, target);
    }

    function acceptChallenge(address source, address target) public payable {
        require(msg.value == acceptChallengeCost); // Pay the right amount
        require(shapeMap[source]); // Source exists
        require(shapeMap[target]); // Target exists
        CryptoShape sourceShape = CryptoShape(source);
        CryptoShape targetShape = CryptoShape(target);
        require(targetShape.owner() == msg.sender); // Target is owned by sender
        require(targetShape.challengesReceived(source) == true); // Challenge exists
        require(sourceShape.challengesSent(target) == true); // Challenge exists

        bool sourceWon = resolveFight(sourceShape, targetShape);
        if (sourceWon) {
            sourceShape.getExperience(experienceForWin(sourceShape.level(), targetShape.level()));
            targetShape.getExperience(experienceForLoss());
        } else {
            targetShape.getExperience(experienceForWin(targetShape.level(), sourceShape.level()));
            sourceShape.getExperience(experienceForLoss());
        }

        emit ChallengeResolved(source, target, sourceWon);
    }

    function rejectChallenge(address source, address target) public {
        require(shapeMap[source]); // Source exists
        require(shapeMap[target]); // Target exists
        CryptoShape sourceShape = CryptoShape(source);
        CryptoShape targetShape = CryptoShape(target);
        require(targetShape.owner() == msg.sender); // Target is owned by sender
        require(targetShape.challengesReceived(source) == true); // Challenge exists
        require(sourceShape.challengesSent(target) == true); // Challenge exists

        sourceShape.challengeRejectedBy(target);
        targetShape.rejectChallengeBy(source);

        emit ChallengeRejected(source, target);

        // Refund the challenge issuer. This line can technically fail.
        // A more robust solution is described here: http://solidity.readthedocs.io/en/develop/common-patterns.html#withdrawal-from-contracts
        sourceShape.owner().transfer(sendChallengeCost);
    }

    function resolveFight(CryptoShape s1, CryptoShape s2) private view returns (bool) {
        // TODO
        return random() % 2 == 0;
    }

    function experienceForWin(uint8 thisLevel, uint8 otherLevel) private pure returns (uint24) {
        int8 levelDiff = int8(otherLevel) - int8(thisLevel);
        if (levelDiff == -10) {
            return 10;
        } else if (levelDiff == -9) {
            return 11;
        } else if (levelDiff == -8) {
            return 12;
        } else if (levelDiff == -7) {
            return 13;
        } else if (levelDiff == -6) {
            return 14;
        } else if (levelDiff == -5) {
            return 15;
        } else if (levelDiff == -4) {
            return 16;
        } else if (levelDiff == -3) {
            return 25;
        } else if (levelDiff == -2) {
            return 40;
        } else if (levelDiff == -1) {
            return 63;
        } else if (levelDiff == 0) {
            return 100;
        } else if (levelDiff == 1) {
            return 158;
        } else if (levelDiff == 2) {
            return 251;
        } else if (levelDiff == 3) {
            return 398;
        } else if (levelDiff == 4) {
            return 631;
        } else if (levelDiff == 5) {
            return 1000;
        } else if (levelDiff == 6) {
            return 1585;
        } else if (levelDiff == 7) {
            return 2512;
        } else if (levelDiff == 8) {
            return 3981;
        } else if (levelDiff == 9) {
            return 6310;
        } else if (levelDiff == 10) {
            return 10000;
        } else {
            return 0;
        }
    }

    function experienceForLoss() private pure returns (uint24) {
        return 5;
    }

    modifier restricted() {
        require(msg.sender == manager);
        _; // Code for the function is placed here
    }

    function random() private view returns (uint) {
        return uint(sha256(block.difficulty, now, block.number, block.coinbase, msg.data, shapes));
    }
}

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
