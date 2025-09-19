import React, { useContext, useState } from "react";
import { CONTEXT_NAMES, DB_NAME, ICON } from "../data/consts.ts";
import CustomMenu, { MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.tsx";
import { Dialog } from "@base-ui-components/react";
import { exportAllData, exportFormationData } from "./helpers/ExportHelper.ts";
import { downloadLogs } from "./helpers/LogHelper.ts";

export function EditorPageHeader() {
  const {selectedFormation, selectedFestival, updateState} = useContext(UserContext);
  const navigate = useNavigate()
  const [showSiteInfo, setShowSiteInfo] = useState<boolean>(false);
  
  return (
    <>
      <CustomMenu
        trigger={
          <img alt="Matsuri logo" src="logo192.png" className='size-8 max-w-8 max-h-8'/>
        }>
        <>
          <MenuItem label="ホームに戻る" onClick={() => {
            updateState({
              selectedFormation: null,
              selectedSection: null,
              selectedFestival: null,
              selectedItems: [],
            });
            navigate("../");
          }} />
          <MenuSeparator/>
          <MenuItem label="サイト情報" onClick={() => {setShowSiteInfo(true)}}/>
        </>
      </CustomMenu>
      {
      selectedFormation && selectedFestival &&
      <h1 className='px-2 font-bold text-center'>
        {selectedFormation?.name} ({selectedFormation.width} x {selectedFormation.length}) ・ {selectedFestival?.name}
      </h1>
      }
      <CustomMenu trigger={
        <img alt="Extra settings" src={ICON.settings} className='size-8 max-w-8 max-h-8'/>
        }>
        <>
          <MenuItem label="全てのデータダウンロード" onClick={() => { exportAllData() }} /> {/** add function to download for formation/festival only? */}
          <MenuSeparator />
          {
            selectedFormation && 
            <>
              <MenuItem label="当隊列のデータダウンロード" onClick={() => { exportFormationData(selectedFormation!.id) }} /> {/** add function to download for formation/festival only? */}
              <MenuSeparator />
            </>
          }
          <MenuItem label="ログダウンロード" onClick={() => { downloadLogs(); }} />
          <MenuSeparator />
          <MenuItem label="Clear Cache" onClick={() => {
            Object.values(CONTEXT_NAMES).forEach((context) => {
              localStorage.removeItem(context);
            });
            window.location.reload();
          }} />
          <MenuSeparator />
          <MenuItem label="Clear DB and Cache" onClick={() => {
            Object.values(CONTEXT_NAMES).forEach((context) => {
              localStorage.removeItem(context);
            });
            indexedDB.deleteDatabase(DB_NAME);
            window.location.reload();
          }} />
        </>
      </CustomMenu>
      <Dialog.Root open={showSiteInfo} modal dismissible onOpenChange={() => setShowSiteInfo(false)}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black opacity-20 transition-all duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 dark:opacity-70" />
            <Dialog.Popup className="fixed top-1/2 left-1/2 -mt-8 w-96 max-w-[calc(100vw-3rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-gray-50 p-6 text-gray-900 outline outline-1 outline-gray-200 transition-all duration-150 data-[ending-style]:scale-90 data-[ending-style]:opacity-0 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 dark:outline-gray-300">
              <Dialog.Title className="-mt-1.5 mb-1 text-lg font-medium">サイト情報</Dialog.Title>
              <Dialog.Description className="mb-6 text-base text-gray-600">
                工事中
              </Dialog.Description>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
    </>
  )
}