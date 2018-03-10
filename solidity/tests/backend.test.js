const assert = require('assert');
const backendFacade = require('../facades/backend');

// backendFacade.useWeb3(require('../web3/ganache'));

describe("Backend facade", () => {
	it("has a resolveRandomMatch function", () => {
		assert.equal(typeof backendFacade.getAllShapes, 'function');
	});
	describe("getAllShapes", () => {
		it("is a function", () => {
			assert.equal(typeof backendFacade.getAllShapes, 'function');
		});
		it("returns a Promise for an array of Shapes", (done) => {
			backendFacade.getAllShapes().then(shapes => {
				assert(shapes instanceof Array);
				shapes.forEach(shape => {
					assert(shape instanceof backendFacade.Shape);
				});
			}).then(done);
		});
	});
});
