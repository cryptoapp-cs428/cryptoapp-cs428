import registerServiceWorker from './registerServiceWorker';
import web3 from './eth/web3';
import sigUtil from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';
import BlockchainFacade from './eth/blockchainFacade.js';

registerServiceWorker();

// https://github.com/danfinlay/js-eth-personal-sign-examples/blob/master/index.js#L37
function sign(from) {
    var msg = ethUtil.bufferToHex(new Buffer('CryptoShapes', 'utf8'));
    var params = [msg, from];
    var method = 'personal_sign';

    // The web3.eth.sign method is broken for version 1.0.0 so
    // here we use a workaround
    web3.currentProvider.sendAsync({
        method,
        params,
        from,
    }, function (err, result) {
        if (err) return console.error(err);
        if (result.error) return console.error(result.error);

        const msgParams = { data: msg };
        msgParams.sig = result.result;
        const recovered = sigUtil.recoverPersonalSignature(msgParams);
        const recoveredAddress = parseInt(recovered, 16);
        const fromAddress = parseInt(from, 16);

        if (typeof recoveredAddress === "number" && typeof fromAddress === "number" && recoveredAddress === fromAddress) {
            console.log('SigUtil Successfully verified signer as ' + from);
            document.getElementById("sign").value = result.result;
        } else {
            console.dir(recovered);
            console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from);
            console.log('Failed, comparing %s to %s', recovered, from);
            alert("Error Signing");
        }
    });
}

if (!web3) {
	alert("No injected Web3 was detected. :( You need to be using MetaMask to use this application.");
}
else {
    BlockchainFacade.getUserAccount().then((accounts) => {
        if (accounts.length >= 0) {
            document.getElementById("eth-address").value = accounts[0];
			sign(accounts[0]);
        }
        else {
            console.log("User has no accounts");
        }
    });
}

