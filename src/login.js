import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import registerServiceWorker from './registerServiceWorker';
import sigUtil from 'eth-sig-util';
import ethUtil from 'ethereumjs-util';
import BlockchainClientUtils from './eth/blockchain.js';

registerServiceWorker();


class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true
        };
    }

    signVerifyCallback(from, msg, err, result) {
        if (err) {
            this.setState({ loading: false });
            return console.error(err);
        }
        if (result.error) {
            this.setState({ loading: false });
            return console.error(result.error);
        }

        const msgParams = { data: msg };
        msgParams.sig = result.result;
        const recovered = sigUtil.recoverPersonalSignature(msgParams);
        const recoveredAddress = recovered.toLowerCase();
        const fromAddress = from.toLowerCase();

        if (recoveredAddress === fromAddress) {
            var that = this;
            const requestBody = {
                ethAddress: fromAddress,
                signature: result.result
            };
            fetch("login", {
                method: "post",
                credentials: "include",
                headers: new Headers({
                   'Content-Type': 'application/json'
                }),
                body: JSON.stringify(requestBody),
            }).catch(function(error){
                that.setState({ loading: false });
                console.log(error);
            }).then(function(res) {
                if (res.redirected) {
                    return window.location.replace(res.url);
                }
                else {
                    that.setState({ loading: false });
                }
            });
        } else {
            console.dir(recovered);
            console.log('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from);
            console.log('Failed, comparing %s to %s', recovered, from);
            alert("Error Signing");
        }
    }

    // https://github.com/danfinlay/js-eth-personal-sign-examples/blob/master/index.js#L37
    sign(from) {
        // The Buffer's first parameter is the string we want to 
        // sign. Might want to change it to something more meaningful
        var msg = ethUtil.bufferToHex(new Buffer('CryptoShapes Sign', 'utf8'));

        BlockchainClientUtils.personalSign(msg, from, this.signVerifyCallback.bind(this, from, msg));
    }

    loadWalletDetails = async () => {
        BlockchainClientUtils.getUserAccount().then((account) => {
            if (account) {
                this.sign(account);
            }
            else {
                this.setState({ loading: false });
                console.error("User has no accounts");
            }
        });
    }

    reattemptLogin = () => {
        this.setState({ loading: true });
        this.loadWalletDetails();
    }

    async componentDidMount() {
        if (this.state.loading) {
            this.loadWalletDetails();
        }
    }

    render() {
        if (this.state.loading) {
            return <img alt="" src="images/loading.gif" />;
        } else {
            return (<div class="major">
                        <ul class="actions">
                            <li><input type="submit" class="button special" onClick={this.reattemptLogin} value="Retry Login"/></li>
                        </ul>
                    </div>);
        }
    }
}

ReactDOM.render(<Login />, document.getElementById('content'));

