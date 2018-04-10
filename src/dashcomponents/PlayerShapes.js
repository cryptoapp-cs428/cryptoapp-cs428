import React, { Component } from 'react';
import ShapeRow from './ShapeRow';

class PlayerShapes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ethAddress: props.ethAddress,
            name: props.name,
            email: props.email,
            shapes: props.myshapes
        };
    }

    addShape() {
        console.log('addShape not implemented..');
    }

    componentDidMount() {}

    // Some properties in the database are not actually stored
    // use arrow function here so that the this value is bound correctly
    infoTableRow = (variable) => {
        // get uppercase version of variable
        var upper = variable && variable[0].toUpperCase() + variable.slice(1);

        if (this.state[variable]) {
            return (
                <tr>
                    <td><b>{upper}</b></td>
                    <td><b id={this.state[variable]}>{this.state[variable]}</b></td>
                </tr>);
        }
        else {
            // jsx element won't render
            return null;
        }
    }

    renderUserShapesTable() {
        if (!this.state.shapes) {
            return <h2>Loading...</h2>;
        }
        else if (this.state.shapes.length > 0) {
            return (
                <div>
                <h2>Shapes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Shape</th>
                            <th>Shape Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.shapes.map((shape) => {
                                return <ShapeRow shape={shape} />;
                            })
                        }
                    </tbody>
                </table>
                </div>
            );
        }
        else {
            return <h2>You Currently Have No Shapes.</h2>;
        }
    }

    render() {
        var that = this;
        return (
            <div>
            <h2>User Info</h2>
            <div className="table-wrapper">
                <table className="alt">
                    <tbody>
                        <tr>
                            <td><b>Eth Address</b></td>
                            <td><b id={this.state.ethAddress}>{this.state.ethAddress}</b></td>
                        </tr>
                        {["name", "email"].map(this.infoTableRow)}
                    </tbody>
                </table>
            </div>
            {this.renderUserShapesTable()}
            <h3>Actions</h3>
            <ul className="actions">
                <li><input type="text" name="new-shape-name" id="new-shape-name" value="" placeholder="Shape Info Goes Here" /></li>
                <li><a className="button special" onClick={() => null}>Create New Animal</a></li>
            </ul>
            </div>
        );
    }
}

export default PlayerShapes;
