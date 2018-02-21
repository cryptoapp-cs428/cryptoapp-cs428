import React from 'react';
import ReactDOM from 'react-dom';
import DashboardObj from './DashboardObj';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DashboardObj />, div);
  ReactDOM.unmountComponentAtNode(div);
});
