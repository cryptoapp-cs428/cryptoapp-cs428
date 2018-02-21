import React, { Component } from 'react';
// import logo from './logo.svg';
import './AnimalsList.css';

class AnimalsList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      animals: []
    };
  }

  componentDidMount() {
  fetch('animals', {
      method: 'get',
      credentials: 'include',

    })
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          animals: result
        });
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
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
