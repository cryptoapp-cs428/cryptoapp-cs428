/**
* This module creates an instance of web3 that uses a WebsocketProvider, so it
* can listen for events. Currently transactions cannot be sent via this web3
* without additional work - it has no accounts associated with it.
*/

require('dotenv').load();
const Web3 = require('web3');

const provider = new Web3.providers.WebsocketProvider(
	// See here: https://github.com/INFURA/infura/issues/29#issuecomment-356366477
	'wss://rinkeby.infura.io/ws'
);

module.exports = new Web3(provider);
