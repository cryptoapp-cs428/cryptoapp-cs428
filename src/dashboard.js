import React from 'react';
import ReactDOM from 'react-dom';
import './dashboard.css';
import AnimalsList from './AnimalsList';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<AnimalsList />, document.getElementById('root-animals-list'));
registerServiceWorker();
