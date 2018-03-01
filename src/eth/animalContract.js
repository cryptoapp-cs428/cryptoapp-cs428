// The address of our contract on the blockchain.
// On Rinkeby: 0x7c7DdF8d4b450b24Bcf4317Ec151E0596057B729
const contractAddress = '0x7c7DdF8d4b450b24Bcf4317Ec151E0596057B729'

const contractABI = [{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getAnimalGenesForIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"manager","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAnimalCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"animalIndexToOwner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"buyAnimal","outputs":[{"name":"","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"getAnimalBirthTimeForIndex","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]

module.exports = {
	address: contractAddress,
	abi: contractABI,
};
