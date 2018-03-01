import Web3 from 'web3';

var web3;

if (!window.web3 || !window.web3.currentProvider) {
	web3 = null; // No web3 injected :(
	console.error("No web3 injected. :(");
} else {
	web3 = new Web3(window.web3.currentProvider);
	// https://ethereum.stackexchange.com/a/17494
	web3.eth.defaultAccount = window.web3.eth.defaultAccount;
}

export default web3;
