const { abi, address } = require('./animalContract');

module.exports = function(web3) {

	const mainContract = new web3.eth.Contract(abi, address);

	// Returns a promise for the default account, or the first account if no default is set
	const getUserAccount = () =>
			web3.eth.defaultAccount
				? Promise.resolve(web3.eth.defaultAccount)
				:	web3.eth.getAccounts().then(accounts => accounts[0]);
	// Returns a promise for the number of animals stored on the blockchain
	const getAnimalCount = () =>
			mainContract.methods.getAnimalCount().call();
	// Returns a promise for the owner of a given animal
	const animalIndexToOwner = id =>
			mainContract.methods.animalIndexToOwner(id).call();

	const getUserAnimals = async () => {
		const userID = await getUserAccount();
		const animalCount = await getAnimalCount();
		// TODO: this will be more better once we store an owner->animals "mapping" in our database.
		const promises = [];
		for (let idx = 0; idx < animalCount; idx++) {
			promises.push(animalIndexToOwner(idx));
		}
		const owners = await Promise.all(promises);
		return owners
			.map((owner, index) => (owner === userID) ? index : -1)
			.filter(index => index !== -1);
	};

	return {
		getUserAccount,
		getAnimalCount,
		animalIndexToOwner,
		getUserAnimals,
	};
}
