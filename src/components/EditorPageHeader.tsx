import React, { useContext, useState } from "react";
import { CONTEXT_NAMES, DB_NAME, DEFAULT_GRID_SIZE, ICON } from "../data/consts.ts";
import CustomMenu, { MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.tsx";
import { exportAllData, exportFormationData } from "../helpers/ExportHelper.ts";
import { downloadLogs } from "../helpers/LogHelper.ts";
import { SiteInfoDialog } from "./dialogs/SiteInfoDialog.tsx";
import { AppModeContext } from "../contexts/AppModeContext.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";
import { GridSizeContext } from "../contexts/GridSizeContext.tsx";

export function EditorPageHeader() {
  const {selectedFestival, updateState} = useContext(UserContext);
  const {updateGridSizeContext} = useContext(GridSizeContext);
  const {selectedFormation, updateFormationContext} = useContext(FormationContext);
  const {appMode, updateAppModeContext} = useContext(AppModeContext);
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
              selectedSection: null,
              selectedFestival: null,
              selectedItems: [],
            });
            updateFormationContext({selectedFormation: undefined});
            navigate("../");
          }} />
          <MenuSeparator/>
          <MenuItem label="サイト情報" onClick={() => {setShowSiteInfo(true)}}/>
        </>
      </CustomMenu>
      {
      selectedFormation && selectedFestival &&
      <h1 className='px-2 font-bold text-center'>
        {selectedFormation?.name}{appMode === "edit" && ` (${selectedFormation.width} x ${selectedFormation.length})`}・ {selectedFestival?.name}
      </h1>
      }
      <div className="flex flex-row gap-2">
        { appMode === "edit" && 
          <button
            onClick={() => {
              updateGridSizeContext({gridSize: DEFAULT_GRID_SIZE});
              updateAppModeContext({appMode: "view"});
            }}>
            <img className='size-8 max-w-8 max-h-8' src={ICON.visibility}/>
          </button>
        }
        { appMode === "view" &&
          <button
            onClick={() => {
              updateGridSizeContext({gridSize: DEFAULT_GRID_SIZE});
              updateAppModeContext({appMode: "edit"});
            }}>
            <img className='size-8 max-w-8 max-h-8' src={ICON.edit}/>
          </button>
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
      </div>
      <SiteInfoDialog isOpen={showSiteInfo}/>
    </>
  )
}