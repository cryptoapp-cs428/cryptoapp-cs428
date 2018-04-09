import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import utility from "./createShapes";

class ShapeRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shape: props.myshape
        };
        console.log("got shape", this.state);
    }

    componentDidMount() {
        var canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
        console.log("the canvas", canvas);
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            utility.createShape(ctx, this.state.shape.ethAddress);
        }
        else {
            alert('This browser does not support HTML5 canvas.');
        }
    }

    render() {
        console.log("rendering shape row");
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
            shapes: [{ethAddress:"0xaaaaaaaaaaaaaaaaa1234"}]
        };
        //this.loadShapes();
    }

    addShape() {
        console.log('addShape..');
    }

    componentDidMount() {
        this.state.shapes.forEach((shape) => {

        });
    }

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
            <hr/>
            <ul className="actions">
                <li><a className="button special" onClick={() => null}>Log Out</a></li>
            </ul>
            </div>
        );
    }
}

export default PlayerShapes;
