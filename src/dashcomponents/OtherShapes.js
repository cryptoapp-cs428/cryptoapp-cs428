import React, { Component } from 'react';
import ShapeRow from './ShapeRow';

class OtherShapes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ethAddress: props.ethAddress,
            shapes: props.othershapes
        };
    }

    componentDidMount() {
    
    }

    render() {
        if (!this.state.shapes) {
            return <h2>Loading...</h2>;
        }
        else if (this.state.shapes.length > 0) {
            return (
                <div>
                <h2>Browse Shapes</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Shape</th>
                            <th>Shape Address</th>
                            <th>User Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            this.state.shapes.map((shape) => {
                                return <ShapeRow shape={shape} challenge={true} />;
                            })
                        }
                    </tbody>
                </table>
                </div>
            );
        }
        else {
            return <h2>There are currently no shapes in existence.</h2>;
        }
    }
}

export default OtherShapes;

