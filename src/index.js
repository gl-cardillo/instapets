import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { UserDataProvider } from './dataContext/dataContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <UserDataProvider>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </UserDataProvider>
);