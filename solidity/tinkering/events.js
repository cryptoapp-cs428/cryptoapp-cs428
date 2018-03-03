const web3 = require('../web3-rinkeby-ws.js');
const abi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "message",
				"type": "uint8"
			}
		],
		"name": "sendPotato",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "number",
				"type": "uint8"
			}
		],
		"name": "Potato",
		"type": "event"
	}
];

const contract = new web3.eth.Contract(abi, '0xa82759f110549c3f67aa1afd4dc9973d72c3023f');

contract.events.Potato(function(error, data) {
	if (error) console.error(error);
	else console.log("Someone called setPotato(", data.returnValues.number, ")");
})
console.log("Listening...");
