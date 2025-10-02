import React, { useContext } from "react";
import { CONTEXT_NAMES, DB_NAME, DEFAULT_GRID_SIZE, ICON } from "../lib/consts.ts";
import CustomMenu, { MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.tsx";
import { exportAllData, exportFormationData } from "../lib/helpers/ExportHelper.ts";
import { downloadLogs } from "../lib/helpers/LogHelper.ts";
import { SiteInfoDialog } from "./dialogs/SiteInfoDialog.tsx";
import { AppModeContext } from "../contexts/AppModeContext.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";
import { VisualSettingsContext } from "../contexts/VisualSettingsContext.tsx";
import { Dialog } from "@base-ui-components/react";

export function EditorPageHeader() {
  const {selectedFestival, selectedSection} = useContext(UserContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {selectedFormation} = useContext(FormationContext);
  const {appMode, updateAppModeContext} = useContext(AppModeContext);
  const navigate = useNavigate()
  
  return (
    <header className='flex items-center justify-between w-full col-span-3 px-4 py-2 border-b-2 border-solid border-grey-200'>
      <CustomMenu
        trigger={
          <img alt="Matsuri logo" src="logo192.png" className='size-8 max-w-8 max-h-8'/>
        }>
        <>
          <MenuItem label="ホームに戻る" onClick={() => {
            navigate("../");
          }} />
          <MenuSeparator/>
          <div className="flex justify-center p-1">
            <Dialog.Root>
              <Dialog.Trigger>
                  サイト情報
              </Dialog.Trigger>
              <SiteInfoDialog/>
            </Dialog.Root>
          </div>
        </>
      </CustomMenu>
      {
      <HeaderNameSection
        sectionTitle={selectedSection?.displayName}
        festivalTitle={selectedFestival?.name}
        formationTitle={selectedFormation?.name}/>
      }
      <div className="flex flex-row gap-2">
        <button
          onClick={() => {
            updateVisualSettingsContext({gridSize: DEFAULT_GRID_SIZE});
            updateAppModeContext({appMode: appMode === "edit" ? "view" : "edit"});
          }}>
          <img alt={appMode === "edit" ? "Go to viewer" : "Go to editor"} className='size-8 max-w-8 max-h-8' src={appMode === "edit" ? ICON.visibility : ICON.editDocument}/>
        </button>
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
    </header>
  )
}

export type HeaderNameSectionProps = {
  festivalTitle?: string,
  formationTitle?: string,
  sectionTitle?: string,
}

export function HeaderNameSection (props: HeaderNameSectionProps) {
  return (
    <>
      {/* Portrait layout */}
      <div className="portrait:flex portrait:flex-col portrait:items-center landscape:hidden text-grey-700">
        <span className="text-sm">{props.festivalTitle} › {props.formationTitle}</span>
        <span className="text-base font-bold">{props.sectionTitle}</span>
      </div>

      {/* Landscape layout */}
      <div className="items-center space-x-2 text-lg font-semibold text-grey-700 portrait:hidden landscape:flex">
        <span>{props.festivalTitle}</span>
        <span>›</span>
        <span>{props.formationTitle}</span>
        <span>›</span>
        <span>{props.sectionTitle}</span>
      </div>
    </>
  );
};