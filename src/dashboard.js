import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import './dashboard.css';
import registerServiceWorker from './registerServiceWorker';

import Header from './dashcomponents/Header';
import PlayerShapes from './dashcomponents/PlayerShapes';
import OtherShapes from './dashcomponents/OtherShapes';
import Challenges from './dashcomponents/Challenges';
import BattleHistory from './dashcomponents/BattleHistory';

registerServiceWorker();

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {};
        this.loadUserData();
    }

    loadUserData() {
        var that = this;
        fetch('user', {
            method: 'get',
            credentials: 'include',

        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            that.setState({ email: json.email });
            that.setState({ name: json.name });
            that.setState({ ethAddress: json.ethAddress });
            that.loadShapes();

        }).catch(function(err) {
            console.log(err);
        });
    }

    loadShapes() {
        var that = this;
        fetch('shapes', {
            method: 'get',
            credentials: 'include',

        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            that.setState({ myshapes: json.filter(shape => shape.userEthAddress.toLowerCase() === that.state.ethAddress.toLowerCase() ) });
            that.setState({ othershapes: json.filter(shape => shape.userEthAddress.toLowerCase() !== that.state.ethAddress.toLowerCase() )});

        }).catch(function(err) {
            console.log(err);
        });
    }

    async componentDidMount() {

    }

    render() {
        return (
            <Router>
                <div>
                    <Header />
                    <div id="main">
                        <section id="content" className="main">
                            <Route exact path="/dashboard" render={(props) =>
                                    <PlayerShapes {...props} myshapes={this.state.myshapes} ethAddress={this.state.ethAddress} name={this.state.name} email={this.state.email} />} />

                                <Route path="/dashboard/browse" render={(props) =>
                                        <OtherShapes {...props} othershapes={this.state.othershapes} ethAddress={this.state.ethAddress} name={this.state.name} email={this.state.email} />} />
                            <Route path="/dashboard/challenges" component={Challenges} />
                            <Route path="/dashboard/history" component={BattleHistory} />
                        </section>
                    </div>

                    <footer id="footer">
                        <p className="copyright">&copy; Crypto App. Design: <a href="https://html5up.net" target="_blank" rel="noopener noreferrer">HTML5 UP</a>.</p>
                    </footer>
                </div>
            </Router>
        );
    }
}

ReactDOM.render(<Dashboard />, document.getElementById('react-inject'));
