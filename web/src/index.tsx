import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import UserCTX from './contexts/usercontext';

ReactDOM.render(
  <React.StrictMode>
    <UserCTX>
      <App />
    </UserCTX>
  </React.StrictMode>,
  document.getElementById('root')
);
