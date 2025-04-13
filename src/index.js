import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LoginPage  from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <GoogleOAuthProvider clientId="571552224930-p6hnre1jsl50s0lr1btuvg4eho9v81tv.apps.googleusercontent.com">
  <LoginPage/>
  </GoogleOAuthProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
