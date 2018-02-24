import Web3 from 'web3';

var web3;

if (!window.web3 || !window.web3.currentProvider) {
	web3 = { version: null } // No web3 injected :(
} else {
	web3 = new Web3(window.web3.currentProvider);
}

export default web3;
