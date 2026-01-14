import '@mantine/core/styles.css';
import './styles/global.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './app/store';
import App from './App';
import './services/axiosClient';
import keycloak from './config/keycloak';

// Check for code in both query string and hash fragment
const searchParams = new URLSearchParams(window.location.search);
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const hasCode = searchParams.has('code') || hashParams.has('code');
// console.log('[main.tsx] URL:', window.location.href);
// console.log('[main.tsx] Search params:', window.location.search);
// console.log('[main.tsx] Hash params:', window.location.hash);
// console.log('[main.tsx] hasCode:', hasCode);

// If we have an auth code, skip Keycloak init entirely and let the backend handle the exchange
if (hasCode) {
  console.log('[main.tsx] Auth code detected, skipping Keycloak init');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  );
} else {
  // Normal flow: initialize Keycloak for session checks
  keycloak.init({
    onLoad: 'check-sso',
    checkLoginIframe: false
  }).then(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  }).catch((err: any) => {
    console.error('Keycloak Init Error:', err);
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    );
  });
}
