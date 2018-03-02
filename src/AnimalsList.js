import React, { Component } from 'react';
// import logo from './logo.svg';
import './AnimalsList.css';
import web3 from './eth/web3';
import contract from './eth/animalContract';

class AnimalsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      animals: []
    };
  }

  async componentDidMount() {
		// Get animals from Blockchain via Metamask
		const animalCount = await contract.methods.getAnimalCount().call();
		const accounts = await web3.eth.getAccounts();
		const userID = accounts[0];
		console.log("UserID: ", userID);
		
		let newAnimals = new Array();
		// TODO: Solidity Team: We should probably make animal retrieval by owner simpler. I think we can do that by storing a mapping of ownerID to animals.
		for (let id = 0; id < animalCount; id++) {
			const ownerID = await contract.methods.animalIndexToOwner(id).call();
			console.log(ownerID);
			if (ownerID == userID) {
				console.log("Animal is owned: ", id);
			}
			newAnimals.push({
				userID: ownerID,
				name: id,
				color: '#FF00FF',
			});
		}
  }

  render() {
    const { error, isLoaded, animals } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        animals.map(animal => (
          <tr>
            <td><b className="animal-owner">{animal.userId}</b></td>
            <td><b className="animal-name">{animal.name}</b></td>
            <td style={{backgroundColor: animal.color}}><b className="animal-color"></b></td>
          </tr>
        ))
      );
    }
  }
}

export default AnimalsList;
