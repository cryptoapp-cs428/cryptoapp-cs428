const { address } = require('../deployed_main_contract.json');
const abi = require('./build_abis/Main_abi.json');

module.exports = function(web3) {

	const mainContract = new web3.eth.Contract(abi, address);

	// Returns a promise for the default account, or the first account if no default is set
	const getUserAccount = () =>
			web3.eth.defaultAccount
				? Promise.resolve(web3.eth.defaultAccount)
				:	web3.eth.getAccounts().then(accounts => accounts[0]);

	return {
		getUserAccount,
		getAnimalCount: async () => 0,
		animalIndexToOwner: async (index) => null,
		getUserAnimals: async () => [],
	};
}
