pragma solidity ^0.4.17;

/// @title The main factory/MMS contract
contract Main {
    event ShapeAdded(address shapeAddress, address owner);
    event ChallengePosted(address sourceShape, address targetShape);
    event ChallengeResolved(address sourceShape, address targetShape, bool sourceWon);
    event ChallengeRejected(address sourceShape, address targetShape);
    event RandomPosted(address shapeAddress);
    event RandomResolved(address winnerShapeAddress, address loserShapeAddress);

    function Main() public {

    }
}
