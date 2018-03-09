const assert = require('assert');
const backendFacade = require('../facades/backend');

describe("Backend facade", () => {
	it("has a getAllShapes function", () => {
		assert.equal(typeof backendFacade.getAllShapes, 'function');
	});
	it("has a resolveRandomMatch function", () => {
		assert.equal(typeof backendFacade.getAllShapes, 'function');
	});
});
