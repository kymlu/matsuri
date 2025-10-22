import React, { useContext } from "react";
import { CONTEXT_NAMES, DB_NAME, DEFAULT_GRID_SIZE, ICON } from "../lib/consts.ts";
import CustomMenu, { MenuContents, MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.tsx";
import { exportAllData, exportFormationData } from "../lib/helpers/ExportHelper.ts";
import { downloadLogs } from "../lib/helpers/LogHelper.ts";
import { SiteInfoDialog } from "./dialogs/SiteInfoDialog.tsx";
import { AppModeContext } from "../contexts/AppModeContext.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";
import { VisualSettingsContext } from "../contexts/VisualSettingsContext.tsx";
import { Dialog, Menu } from "@base-ui-components/react";
import { GeneralSiteInfoDialog } from "./dialogs/GeneralSiteInfoDialog.tsx";
import { EditFestivalDialog } from "./dialogs/editFestival/EditFestivalDialog.tsx";
import { strEquals } from "../lib/helpers/GlobalHelper.ts";

export function EditorPageHeader() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {selectedFestival, selectedSection} = useContext(UserContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {selectedFormation} = useContext(FormationContext);
  const {appMode, userType, updateAppModeContext} = useContext(AppModeContext);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (userType === "admin") {
      navigate("/manager");
    } else {
      navigate("../");
    }
  };

  return (
    <header className='flex items-center justify-between w-full col-span-3 px-4 py-2 border-b-2 border-solid border-grey-200'>
      <div className='flex flex-row items-center gap-2'>
        <CustomMenu
          trigger={
            <img alt="Matsuri logo" src="logo192.png" className='size-8 max-w-8 max-h-8'/>
          }>
          <MenuItem label="ホームに戻る" onClick={() => handleHomeClick()} />
        </CustomMenu>
        {
          userType === "admin" &&
          <CustomMenu
            trigger={
              <img alt="Festival edit" src={ICON.festival} className='size-8 max-w-8 max-h-8'/>
            }>
            <MenuItem label="祭り編集" onClick={() => {setDialogOpen(true)}} />
            <MenuSeparator/>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger
                className="flex flex-row p-1 text-center rounded-md cursor-pointer lg:hover:bg-grey-200">
                  別の隊列を編集 <img className="size-6" src={ICON.chevronForwardBlack}/>
              </Menu.SubmenuTrigger>
              <MenuContents position="right">
                {
                  selectedFestival?.formations.filter(x => !strEquals(x.id, selectedFestival.id))
                    .map((formation, index) => (
                      <>
                        <MenuItem
                          key={formation.id}
                          label={formation.name}
                          onClick={() => {
                            console.log("Todo: implement formation switch");
                          }}/>
                        {
                          index !== selectedFestival?.formations.length - 1 && <MenuSeparator/>
                        }
                      </>
                  ))
                }
              </MenuContents>
            </Menu.SubmenuRoot>
            <MenuSeparator/>
            <MenuItem label="隊列比較" onClick={() => {
              console.log("Todo: implement formation compare");
            }} />
            <MenuSeparator/>
            <MenuItem label="別の隊列で上書き" onClick={() => {
              console.log("Todo: overwrite formation");
            }} />
          </CustomMenu>
        }
      </div>
      {
      <HeaderNameSection
        sectionTitle={selectedSection?.displayName}
        festivalTitle={selectedFestival?.name}
        formationTitle={selectedFormation?.name}/>
      }
      {
        userType === "general" &&
        <Dialog.Root>
          <Dialog.Trigger>
              <img alt="Site information" src={ICON.help} className='size-8 max-w-8 max-h-8'/>
          </Dialog.Trigger>
          <GeneralSiteInfoDialog/>
        </Dialog.Root>
      }
      {
        userType === "admin" &&
        <div className="flex flex-row gap-2">
          <Dialog.Root>
            <Dialog.Trigger>
                <img alt="Site information" src={ICON.help} className='size-8 max-w-8 max-h-8'/>
            </Dialog.Trigger>
            <SiteInfoDialog/>
          </Dialog.Root>
          <button
            onClick={() => {
              updateVisualSettingsContext({gridSize: DEFAULT_GRID_SIZE});
              updateAppModeContext({appMode: appMode === "edit" ? "view" : "edit"});
            }}>
            <img
              alt={appMode === "edit" ? "Go to viewer" : "Go to editor"}
              className='size-8 max-w-8 max-h-8'
              src={appMode === "edit" ? ICON.visibility : ICON.editDocument}/>
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
      }
      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <EditFestivalDialog/>
      </Dialog.Root>
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
