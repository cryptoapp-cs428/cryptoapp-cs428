import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => (
	<nav id="nav">
		<ul>
			<li><Link to='/dashboard'>My Shapes</Link></li>
			<li><Link to='/dashboard/browse'>Browse</Link></li>
			<li><Link to='/dashboard/challenges'>Challenges</Link></li>
			<li><Link to='/dashboard/history'>History</Link></li>
		</ul>
	</nav>
);

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
