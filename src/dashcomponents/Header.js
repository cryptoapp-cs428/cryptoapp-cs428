import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class NavBar extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    logOut() {
        console.log('logOut..');

        fetch('logout', {
            method: 'get',
            credentials: 'include'
        }).then(function(response) {
            if (response.redirected) {
                return window.location.replace(response.url);
            }

            console.log(response);
        }).catch(function(err) {
            console.err(err);
        });
    }

    render() {
        return (
            <nav id="nav">
                <ul>
                    <li><Link to='/dashboard'>My Shapes</Link></li>
                    <li><Link to='/dashboard/browse'>Browse</Link></li>
                    <li><Link to='/dashboard/challenges'>Challenges</Link></li>
                    <li><Link to='/dashboard/history'>History</Link></li>
                    <li><a href="" onClick={this.logOut}>Log Out</a></li>
                </ul>
            </nav>);
    }
}

const Banner = () => (
    <header id='header'>
        <h1>Member Dashboard</h1>
        <p>Buy Some Shapes to Get Started</p>
    </header>
);

const Header = () => {
	return (
		<div>
			<Banner />
			<NavBar />
		</div>
	);
};

export default Header;
