import React from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from "aws-amplify";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import awsExports from "./aws-exports";
import authConfig from "./auth-config";

const mergedConfig = {
  ...authConfig,
  API: {
    ...awsExports.API,
    GraphQL: {
      ...awsExports.API?.GraphQL,
      defaultAuthMode: "apiKey",
    },
  },
};

Amplify.configure(mergedConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
