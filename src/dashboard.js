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
        console.log('loadUserData..');

        fetch('user', {
            method: 'get',
            credentials: 'include',

        }).then(function(response) {
            return response.json();
        }).then(function(json) {
            console.log(json);

            this.setState({ email: json.email });
            this.setState({ name: json.name });
            this.setState({ ethAddress: json.ethAddress });

        }).catch(function(err) {
            console.log(err);
        });
    }

    async componentDidMount() {

    }

    logOut() {
        console.log('logOut..')

        fetch('logout', {
            method: 'get',
            credentials: 'include'
        }).then(function(response) {
            if (response.redirected) {
                return window.location.replace(response.url);
            }

            console.log(response);
        }).catch(function(err) {
            console.log(err);
        });
    }

    render() {
        return (
            <Router>
                <div>
                    <Header />
                    <div id="main">
                        <section id="content" className="main">
                            <Route exact path="/dashboard" render={(props) => <PlayerShapes {...props} ethAddress={this.state.ethAddress} name={this.state.name} email={this.state.email} />} />
                            <Route path="/dashboard/browse" component={OtherShapes} />
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
