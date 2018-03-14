import React, { Component } from 'react';

class OtherShapes extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
    
    }

    render() {
        return (
            <div>
                <h1>Browse Shapes</h1>
                <table className="alt">
                    <thead>
                        <tr>
                          <th>Owner</th>
                          <th>Name</th>
                          <th>Color</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td>owner</td>
                            <td>name</td>
                            <td>color</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default OtherShapes;
