const web3 = require('../web3/rinkeby');
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "newOut",
				"type": "uint8"
			}
		],
		"name": "setOut",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "out",
		"outputs": [
			{
				"name": "",
				"type": "uint8"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	}
];

const contract = new web3.eth.Contract(abi, '0x66e6916f253ae5dc2ca21ce22248e9f60bf99abd');

let acts = null;
web3.eth.getAccounts()
	.then(accounts => {
		acts = accounts;
		return web3.eth.getBalance(acts[0]);
	})
	.then(console.log.bind(console, "Balance before call to getter: "))
	.then(() => contract.methods.out().call({ from: acts[0] }))
	.then(console.log.bind(console, "Result of getter: "))
	.then(() => web3.eth.getBalance(acts[0]))
	.then(console.log.bind(console, "Balance after call to getter: "))
