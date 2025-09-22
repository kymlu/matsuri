import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import * as serviceWorkerRegistration from './serviceWorkerRegistration.ts';
import { UserContextProvider } from './contexts/UserContextProvider.tsx';
import { CategoryContextProvider } from './contexts/CategoryContextProvider.tsx';
import { SectionContextProvider } from './contexts/SectionContextProvider.tsx';
import { DBProvider } from './data/DBProvider.tsx';
import { AnimationContextProvider } from './contexts/AnimationContextProvider.tsx';
import { SettingsContextProvider } from './contexts/SettingsContextProvider.tsx';
import { AppModeContextProvider } from './contexts/AppModeContext.tsx';
import { EntitiesContextProvider } from './contexts/EntitiesContextProvider.tsx';
import { FormationContextProvider } from './contexts/FormationContext.tsx';
import { GridSizeContextProvider } from './contexts/GridSizeContext.tsx';
import { PositionContextProvider } from './contexts/PositionContext.tsx';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <DBProvider>
      <UserContextProvider>
        <PositionContextProvider>
          <CategoryContextProvider>
            <SectionContextProvider>
              <AnimationContextProvider>
                <EntitiesContextProvider>
                  <SettingsContextProvider>
                    <AppModeContextProvider>
                      <FormationContextProvider>
                        <GridSizeContextProvider>
                          <App />
                        </GridSizeContextProvider>
                      </FormationContextProvider>
                    </AppModeContextProvider>
                  </SettingsContextProvider>
                </EntitiesContextProvider>
              </AnimationContextProvider>
            </SectionContextProvider>
          </CategoryContextProvider>
        </PositionContextProvider>
      </UserContextProvider>
    </DBProvider>
  </React.StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
