import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import utility from "./createShapes";

class ShapeRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shape: props.myshape
        };
    }

    componentDidMount() {
        var canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
        console.log("the canvas", canvas);
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            console.log(this.state.shape.color);
            console.log(this.state.shape.color.toString(16));
            utility.createShape(ctx, this.state.shape.ethAddress, (this.state.shape.color).toString(16), this.state.shape.level);
        }
        else {
            alert('This browser does not support HTML5 canvas.');
        }
    }

    render() {
        return (
            <tr>
                <td>
                    <canvas id={this.state.shape.ethAddress} ref="myCanvas" width="100" style={{color: "#FF0000"}} height="100"></canvas>
                </td>
            </tr>
            );
    }
}

class PlayerShapes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ethAddress: props.ethAddress,
            name: props.name,
            email: props.email,
            shapes: []
        };
        console.log(this.state);
        this.loadShapes();
    }

    addShape() {
        console.log('addShape..');
    }

    componentDidMount() {}

    loadShapes() {
        console.log('loading shape Data...');

        var that = this;
        fetch('shapes', {
            method: 'get',
            credentials: 'include',

        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            console.log("this is the user data: ", json);
            that.setState({ shapes: json });

        }).catch(function(err) {
            console.log(err);
        });
    }

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
                            <td><b id={this.state.ethAddress}>{this.state.ethAddress}</b></td>
                        </tr>
                        {["name", "email"].map(this.infoTableRow)}
                    </tbody>
                </table>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Shape</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.shapes.map(function(shape) {
                        console.log(shape);
                        return (<ShapeRow myshape={shape} />);
                    })}
                </tbody>
            </table>
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
