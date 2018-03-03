const web3 = require('./web3/rinkeby');
const fs = require('fs-extra');
const path = require('path');

const contractPath = path.resolve(__dirname, './build/AnimalBase_full.json');

// Make sure compiled output is on disk
if (!fs.existsSync(contractPath)) {
	// Run compile script:
	require('./compile');
	if (!fs.existsSync(contractPath)) {
		// Bad, exit with error
		console.error("Compilation failed!");
		process.exit(1);
	}
} else {
	console.log("Using existing contract compilation. Run 'npm run solidity:compile' to recompile.");
}

const compiledContract = fs.readJsonSync(contractPath);
const abi = compiledContract['interface'];
const bytecode = compiledContract.bytecode;

const acctIdx = process.env.DEPLOY_ACCT_INDEX
		|| 0;

(async function() {
	// Get list of accts
	const accts = await web3.eth.getAccounts();
	if (!accts) throw new Error("No accounts found!");
	const acct = accts[acctIdx];

	console.log("Deploying from account:", acct);

	// Use acct to deploy contract
	const result = await new web3.eth.Contract(JSON.parse(abi))
		.deploy({
			data: bytecode,
		})
		.send({
			from: acct,
			gas: '1000000'
		})

	console.log("Deployed at address:", result.options.address);

})().catch(console.error);
