import React, { createContext, useContext, useEffect, useState } from 'react';
import { IndexedDBController } from './IndexedDbController.ts';
import { CUSTOM_EVENT } from './consts.ts';

const DBContext = createContext({ dbReady: false });

export const dbController: IndexedDBController = new IndexedDBController();

export const DBProvider = ({ children }) => {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await dbController.init();
    };
    window.addEventListener(CUSTOM_EVENT.dbInitialized.toString(), (e) => {
      console.log("DB is ready");
      setDbReady(true);
    })
    init();
  }, []);

  return (
    <DBContext.Provider value={{ dbReady }}>
      {children}
    </DBContext.Provider>
  );
};

export const useDB = () => useContext(DBContext);
