import React from 'react';
import ReactDOM from 'react-dom';
import './dashboard.css';
import AnimalsList from './AnimalsList';
import registerServiceWorker from './registerServiceWorker';
import web3 from './eth/web3.js';

ReactDOM.render(<AnimalsList />, document.getElementById('root-animals-list'));
registerServiceWorker();

if (!web3) {
	alert("No injected Web3 was detected. :( You need to be using MetaMask to use this application.")
}
