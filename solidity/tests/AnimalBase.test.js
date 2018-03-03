const assert = require('assert');
const web3 = require('../web3/ganache');

const { abi, bytecode } = require('../compile');


let accts, contract, sendOpts;

beforeEach(async () => {
		// Get list of accts
		accts = await web3.eth.getAccounts();

		sendOpts = {
			from: accts[0],
			gas: '1000000'
		};

		// Use acct to deploy contract
		contract = await new web3.eth.Contract(JSON.parse(abi))
			.deploy({
				data: bytecode
			})
			.send(sendOpts)

		contract.setProvider(web3.currentProvider);
});

describe("AnimalBase", () => {

	it("deploys a contract", () => {
		assert.ok(contract);
		assert.ok(contract.options.address);
	});
	
	it("can buy an animal", async () => {
		const preAnimalCount = await contract.methods.getAnimalCount().call({
			from: accts[0]
		});
		assert.equal(preAnimalCount, 0);
		
		await contract.methods.buyAnimal().send({
			from: accts[0],
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});
		
		const postAnimalCount = await contract.methods.getAnimalCount().call({
			from: accts[0]
		});
		assert.equal(postAnimalCount, 1);
	});
	
	it("can get animal info", async () => {
		// Buy first animal
		await contract.methods.buyAnimal().send({
			from: accts[0],
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});
		// Buy second animal
		await contract.methods.buyAnimal().send({
			from: accts[0],
			value: web3.utils.toWei('0.01', 'ether'),
			gas: '3000000'
		});
		// Make sure there are 2 animals
		const postAnimalCount = await contract.methods.getAnimalCount().call({
			from: accts[0]
		});
		assert.equal(postAnimalCount, 2);
		
		// Get the first animal's genes
		const genes0 = await contract.methods.getAnimalGenesForIndex(0).call({
			from: accts[0]
		});
		assert.ok(genes0);
		console.log("Genes 0: ", genes0);
		
		// Get the second animal's genes
		const genes1 = await contract.methods.getAnimalGenesForIndex(1).call({
			from: accts[0]
		});
		assert.ok(genes1);
		console.log("Genes 1: ", genes1);
		
		// Make sure the genes are not equal
		assert.notEqual(genes0, genes1);
		
		// Get the first animal's birth time
		const birth0 = await contract.methods.getAnimalBirthTimeForIndex(0).call({
			from: accts[0]
		})
		assert.ok(birth0);
		console.log("Birth 0: ", birth0);
		
		// Get the second animal's birth time
		const birth1 = await contract.methods.getAnimalBirthTimeForIndex(1).call({
			from: accts[0]
		})
		assert.ok(birth1);
		console.log("Birth 1: ", birth1);
		
		// Make sure the birth times are very close
		assert(Math.abs(birth0 - birth1) < 10);
	});
	
});

/*
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);
const { interface, bytecode } = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
	accounts = await web3.eth.getAccounts();
	lottery = await new web3.eth.Contract(JSON.parse(interface))
			.deploy({ data: bytecode })
			.send({ from: accounts[0], gas: '1000000' });
	lottery.setProvider(provider);
});

describe('Lottery Contract', () => {
	it('deploys a contract', () => {
		assert.ok(lottery.options.address);
	});
	
	it('allows one player entry', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.01', 'ether')
		});
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(accounts[0], players[0]);
		assert.equal(1, players.length);
	});
	
	it('allows multiple player entry', async () => {
		await lottery.methods.enter().send({
			from: accounts[0],
			value: web3.utils.toWei('0.01', 'ether')
		});
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.01', 'ether')
		});
		await lottery.methods.enter().send({
			from: accounts[2],
			value: web3.utils.toWei('0.01', 'ether')
		});
		
		const players = await lottery.methods.getPlayers().call({
			from: accounts[0]
		});
		assert.equal(accounts[0], players[0]);
		assert.equal(accounts[1], players[1]);
		assert.equal(accounts[2], players[2]);
		assert.equal(3, players.length);
	});
	
	it('requires a minimum amount of ether to enter', async () => {
		try {
			await lottery.methods.enter().send({
				from: accounts[0],
				value: web3.utils.toWei('0.001', 'ether')
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});
	
	it('only manager can call pickwinner', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: accounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	});
	
	it('runs contract completely', async () => {
		await lottery.methods.enter().send({
			from: accounts[1],
			value: web3.utils.toWei('0.01', 'ether')
		});
		const initialBalance = await web3.eth.getBalance(accounts[1]);
		await lottery.methods.pickWinner().send({
			from: accounts[0]
		});
		const postBalance = await web3.eth.getBalance(accounts[1]);
		const difference = postBalance - initialBalance;
		assert(difference > web3.utils.toWei('0.008', 'ether'));
		const players = await lottery.methods.getPlayers().call( {
			from: accounts[0]
		});
		assert.equal(0, players.length);
//		const lotteryBalance = await web3.eth.getBalance(lottery.address);
//		assert.equal(0, lotteryBalance);
	});
});
*/