import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';
import { UserContextProvider } from './contexts/UserContextProvider.tsx';
import { FormationEditorContextProvider } from './contexts/FormationEditorContextProvider.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <UserContextProvider>
      <FormationEditorContextProvider>
        <App />
      </FormationEditorContextProvider>
    </UserContextProvider>
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
