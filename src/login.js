import registerServiceWorker from './registerServiceWorker';
import sigUtil from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';
import BlockchainClientUtils from './eth/blockchain.js';

registerServiceWorker();


function signVerifyCallback(from, msg, err, result) {
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
}

// https://github.com/danfinlay/js-eth-personal-sign-examples/blob/master/index.js#L37
function sign(from) {
    // The Buffer's first parameter is the string we want to 
    // sign. Might want to change it to something more meaningful
    var msg = ethUtil.bufferToHex(new Buffer('Crypto Shapes', 'utf8'));

    BlockchainClientUtils.personalSign(msg, from, signVerifyCallback.bind(null, from, msg));
}

BlockchainClientUtils.getUserAccount().then((account) => {
    if (account !== 0) {
        document.getElementById("eth-address").value = account;
        sign(account);
    }
    else {
        console.log("User has no accounts");
    }
});

