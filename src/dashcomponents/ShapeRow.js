import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import utility from "./createShapes";

class ShapeRow extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shape: props.shape,
            challenge: props.challenge || false
        };
    }

    componentDidMount() {
        var canvas = ReactDOM.findDOMNode(this.refs.myCanvas);
        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");
            utility.createShape(ctx, this.state.shape.ethAddress, (this.state.shape.color).toString(16), this.state.shape.level);
        }
        else {
            alert('This browser does not support HTML5 canvas.');
        }
    }

    options() {
        if (this.state.challenge) {
            return (
                <div>
                    <td>{this.state.shape.userEthAddress}</td>
                    <td><a href="">Challenge</a></td>
                </div>
            );
        }
        else {
            return null;
        }
    }

    render() {
        return (
            <tr>
                <td>
                    <canvas id={this.state.shape.ethAddress} ref="myCanvas" width="100" height="100"></canvas>
                </td>
                <td>{this.state.shape.ethAddress}</td>
                {this.options()}
            </tr>
            );
    }
}

export default ShapeRow;

