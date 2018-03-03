console.warn("The deploy script is currently broken. :( Please make sure your repository is up to date.");
process.exit(0);

const web3 = require('./web3/rinkeby');
const { abi, bytecode} = require('./compile');

const acctIdx = process.env.DEPLOY_ACCT_INDEX
		|| 0;

(async function() {
	// Get list of accts
	const accts = await web3.eth.getAccounts();
	if (!accts) throw new Error("No accounts found!");
	const acct = accts[acctIdx];

	console.log("Deploying from ", acct);

	// Use acct to deploy contract
	const result = await new web3.eth.Contract(JSON.parse(abi))
		.deploy({
			data: bytecode,
		})
		.send({
			from: acct,
			gas: '1000000'
		})

	console.log("Deployed to ", result.options.address);
	console.log("Contract Interface: ", abi);

})().catch(console.error);
