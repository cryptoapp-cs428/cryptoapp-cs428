require('dotenv').load();
const Web3 = require('web3');

const provider = new Web3.providers.WebsocketProvider(
	'wss://rinkeby.infura.io/ws'
);

module.exports = new Web3(provider);
