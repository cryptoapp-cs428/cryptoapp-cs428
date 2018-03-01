import React, { Component } from 'react';
// import logo from './logo.svg';
import './AnimalsList.css';
import blockchain from './eth/blockchain';

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
		let animals = await blockchain.getUserAnimals();
    this.setState({ animals });
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
