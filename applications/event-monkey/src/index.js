import React from 'react';
import axios from "axios";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'

import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

axios.defaults.baseURL = 'http://eventmonkey.xyz:4000/';
// axios.defaults.baseURL = 'http://localhost:4000/';

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

