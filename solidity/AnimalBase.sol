pragma solidity ^0.4.17;

/// @title Base contract for CryptoAnimals. Holds all common structs and base variables.
contract AnimalBase {
    
    /*** DATA TYPES ***/

    /// @dev The main Animal struct. Every animal is a copy
    ///  of this structure, so make sure that it fits neatly into
    ///  256-bit words. The order of the members in this structure
    ///  is important because of the byte-packing rules used by Ethereum.
    ///  Ref: http://solidity.readthedocs.io/en/develop/miscellaneous.html
    struct Animal {
        // The Animals's genetic code
        uint256 genes;

        // The timestamp from the block when this aniaml was created.
        uint64 birthTime;
    }
    
    /*** CONSTANTS ***/
    /// @dev The price to purchase a new animal
    uint animalPrice = 0.01 ether;

    /*** STORAGE ***/
    
    address public manager;
    
    /// @dev An array containing the Animal struct for all Animals in existence. The ID
    /// of each animal is an index into this array.
    Animal[] animals;

    /// @dev A mapping from animal IDs to the address that owns them. All animals have
    ///  some valid owner address.
    mapping (uint256 => address) public animalIndexToOwner;
    
    /*** API ***/
    
    function AnimalBase() public {
        manager = msg.sender;
    }
    
    /// @dev Create a new animal and assign it to be owned by the purchaser.
    /// Returns the id of the new animal
    function buyAnimal() public payable returns (uint) {
        require(msg.value == animalPrice);
        uint genes = _random();
        uint id = _createAnimal(genes, msg.sender);
        return id;
    }
    
    function getAnimalCount() public view returns (uint) {
        return animals.length;
    }
    
    function getAnimalGenesForIndex(uint index) public view returns (uint256) {
        require(index < animals.length);
        return animals[index].genes;
    }
    
    function getAnimalBirthTimeForIndex(uint index) public view returns (uint256) {
        require(index < animals.length);
        return animals[index].birthTime;
    }
    
    /*** Inner functions ***/

    /// @dev Assigns ownership of a specific Animal to an address.
    function _assignAnimalToOwner(address _owner, uint256 _tokenId) internal {
        // give ownership
        animalIndexToOwner[_tokenId] = _owner;
    }

    /// @dev An internal method that creates a new animal and stores it. This
    ///  method doesn't do any checking and should only be called when the
    ///  input data is known to be valid.
    /// @param _genes The animals's genetic code.
    /// @param _owner The inital owner of this animal
    function _createAnimal(uint256 _genes, address _owner) internal returns (uint) {
        Animal memory _animal = Animal({
            genes: _genes,
            birthTime: uint64(block.timestamp)
        });
        uint256 newAnimalId = animals.push(_animal) - 1;

        _assignAnimalToOwner(_owner, newAnimalId);

        return newAnimalId;
    }
    
    /// Return a pseudorandom number. This might need to be more random (TODO).
    function _random() internal view returns (uint) {
        return uint(sha256(block.difficulty, block.timestamp, animals.length));
    }
}