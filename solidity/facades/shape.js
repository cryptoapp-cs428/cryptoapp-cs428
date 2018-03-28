const shapeAbi = require('./build_abis/CryptoShape_abi.json');

var web3 = null;

class Shape {
	constructor(address) {
		this.id = address;
		this.contract = new web3.eth.Contract(shapeAbi, address);
	}

	toJSON() {
		return {
			id: this.id,
			// TODO: what else?
		}
	}
	async owner() {
		return await this.contract.methods.owner().call();
	}
	async level() {
		return await this.contract.methods.level().call();
	}
	async experience() {
		return await this.contract.methods.experience().call();
	}
	async awaitingRandomFight() {
		return await this.contract.methods.awaitingRandomFight().call();
	}
	async rgbColor() {
		return await this.contract.methods.rgbColor().call();
	}
}

// A utility method for inflating Shape objects from JSON representation
Shape.fromJSON = function(json) {
	const shape = new Shape(json.address);
	// TODO: what else?
	return shape;
};
Shape.address = function() {
	return this.id;
};

Shape.useWeb3 = newWeb3 => web3 = newWeb3;

module.exports = Shape;
