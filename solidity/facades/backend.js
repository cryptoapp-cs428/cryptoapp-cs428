const mockData = require('./_mockData.json');
const Shape = require('./shape');

var web3 = null;
function useWeb3(newWeb3) {
	Shape.useWeb3(newWeb3);
	web3 = newWeb3;
}

const shapes = mockData.shapes.map(Shape.fromJSON);

module.exports = {
	// Include Shape class for reference
	Shape,

	async getAllShapes(){
		return shapes;
	},
	async resolveRandomMatch(shapeID1, shapeID2) {
		// Stub function, does nothing yet
	},
	useWeb3,
};
