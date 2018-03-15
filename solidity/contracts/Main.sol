pragma solidity ^0.4.17;

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
