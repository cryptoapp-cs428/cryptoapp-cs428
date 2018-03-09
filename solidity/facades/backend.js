const mockData = require('./_mockData.json');
const Shape = require('./shape');

// TODO: call Shape.useWeb3(?) with some web3 instance

const shapes = mockData.shapes.map(Shape.fromJSON);

module.exports = {
	async getAllShapes(){
		return shapes;
	},
	async resolveRandomMatch(shapeID1, shapeID2) {
		// Stub function, does nothing yet
	},
};
