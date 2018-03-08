import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './dashboard.css';
import AnimalsList from './AnimalsList';
import registerServiceWorker from './registerServiceWorker';
import web3 from './eth/web3';

//import contract from './eth/animalContract';

//class AnimalContractInterfacer extends Component {
//	
//	constructor(props) {
//		super(props);
//		this.state = {manager: ''};
//	}
//	
//	async componentDidMount() {
//		const manager = await contract.methods.manager().call();
//		this.setState({ manager });
//	}
//	
//	render() {
//		return (
//			<div>
//				<h2>Animal Contract</h2>
//				<p>This contract is managed by { this.state.manager }</p>
//			</div>
//		);
//	}
//}
//
//ReactDOM.render(<AnimalContractInterfacer />, document.getElementById('contract-interface'));

// ReactDOM.render(<AnimalsList />, document.getElementById('root-animals-list'));
registerServiceWorker();

console.log(web3);
if (!web3) {
	alert("No injected Web3 was detected. :( You need to be using MetaMask to use this application.");
}


