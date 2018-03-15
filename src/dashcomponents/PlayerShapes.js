import React, { Component } from 'react';

class PlayerShapes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ethAddress: props.ethAddress,
            name: props.name,
            email: props.email
        };
    }

    addShape() {
        console.log('addShape..');
    }

    componentDidMount() {

    }

    render() {
        return (
            <div>
            <h1>User Info</h1>
            <div className="table-wrapper">
                <table className="alt">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><b>Eth Address</b></td>
                            <td><b id={this.state.ethAddress}></b></td>
                        </tr>
                        <tr>
                            <td><b>Email</b></td>
                            <td><b id={this.state.email}></b></td>
                        </tr>
                        <tr>
                            <td><b>Name</b></td>
                            <td id={this.state.name}></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <h3>Actions</h3>
            <ul className="actions">
                <li><input type="text" name="new-shape-name" id="new-shape-name" value="" placeholder="Shape Info Goes Here" /></li>
                <li><a className="button special" onClick={() => null}>Create New Animal</a></li>
            </ul>
            <hr/>
            <ul className="actions">
                <li><a className="button special" onClick={() => null}>Log Out</a></li>
            </ul>
            </div>
        );
    }
}

export default PlayerShapes;
