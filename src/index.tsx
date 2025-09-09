import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';
import { UserContextProvider } from './contexts/UserContextProvider.tsx';
import { CategoryContextProvider } from './contexts/CategoryContextProvider.tsx';
import { PositionContextProvider } from './contexts/PositionContextProvider.tsx';
import { SectionContextProvider } from './contexts/SectionContextProvider.tsx';
import { DBProvider } from './data/DBProvider.tsx';
import { AnimationContextProvider } from './contexts/AnimationContextProvider.tsx';
import { FormationContextProvider } from './contexts/FormationContextProvider.tsx';
import { ExportContextProvider } from './contexts/ExportContextProvider.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <DBProvider>
      <UserContextProvider>
        <PositionContextProvider>
          <CategoryContextProvider>
            <SectionContextProvider>
              <AnimationContextProvider>
                <FormationContextProvider>
                  <ExportContextProvider>
                    <App />
                  </ExportContextProvider>
                </FormationContextProvider>
              </AnimationContextProvider>
            </SectionContextProvider>
          </CategoryContextProvider>
        </PositionContextProvider>
      </UserContextProvider>
    </DBProvider>
  // </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
