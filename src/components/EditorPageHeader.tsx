import React, { useContext } from "react";
import { CONTEXT_NAMES, DB_NAME, DEFAULT_GRID_SIZE, ICON } from "../lib/consts.ts";
import CustomMenu, { MenuContents, MenuItem, MenuSeparator } from "./CustomMenu.tsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext.tsx";
import { exportFestivalData, exportForGithub } from "../lib/helpers/ExportHelper.ts";
import { downloadLogs } from "../lib/helpers/LogHelper.ts";
import { SiteInfoDialog } from "./dialogs/SiteInfoDialog.tsx";
import { AppModeContext } from "../contexts/AppModeContext.tsx";
import { FormationContext } from "../contexts/FormationContext.tsx";
import { VisualSettingsContext } from "../contexts/VisualSettingsContext.tsx";
import { Dialog, Menu } from "@base-ui-components/react";
import { GeneralSiteInfoDialog } from "./dialogs/GeneralSiteInfoDialog.tsx";
import { EditFestivalDialog } from "./dialogs/editFestival/EditFestivalDialog.tsx";
import { strEquals } from "../lib/helpers/GlobalHelper.ts";
import { getFormationFile } from "../lib/helpers/JsonReaderHelper.ts";
import { PositionContext } from "../contexts/PositionContext.tsx";
import { groupByKey, indexByKey } from "../lib/helpers/GroupingHelper.ts";
import { EntitiesContext } from "../contexts/EntitiesContext.tsx";
import { GetAllForFormation } from "../data/DataController.ts";
import { getByFormationId, getById, upsertList } from "../data/DataRepository.ts";
import { Formation } from "../models/Formation.ts";

export function EditorPageHeader() {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {selectedFestival, selectedSection, updateState} = useContext(UserContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {selectedFormation, updateFormationContext} = useContext(FormationContext);
  const {updateEntitiesContext} = useContext(EntitiesContext);
  const {updatePositionContextState} = useContext(PositionContext);
  const {appMode, userType, updateAppModeContext} = useContext(AppModeContext);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (userType === "admin") {
      navigate("/manager");
    } else {
      navigate("../");
    }
  };

  const switchFormation = (formation: Formation) => {
    if (selectedFestival === null) return;
    
    console.log(`Switching to formation: ${formation.name}`, formation);
    
    getByFormationId("formationSection", formation.id)
      .then(async (sections) => {
        var sectionsExist = sections.length > 0;
        if (sectionsExist) {
          GetAllForFormation(selectedFestival.id, formation.id,
            (
              formationSections, participants, props, placeholders, 
              participantPositions, propPositions, notePositions, 
              arrowPositions, placeholderPositions
            ) => {
              updateFormationContext({selectedFormation: formation});
              updateState({
                currentSections: formationSections,
                selectedSection: formationSections[0],
                selectedItems: []
              });
              updateEntitiesContext({
                participantList: indexByKey(participants, "id"),
                propList: indexByKey(props, "id"),
              });
              updatePositionContextState({
                participantPositions: groupByKey(participantPositions, "formationSectionId"),
                propPositions: groupByKey(propPositions, "formationSectionId"),
                notePositions: groupByKey(notePositions, "formationSectionId"),
                arrowPositions: groupByKey(arrowPositions, "formationSectionId"),
                placeholderPositions: groupByKey(placeholderPositions, "formationSectionId"),
              });
              updateEntitiesContext({
                placeholderList: indexByKey(placeholders, "id"),
              });
            }
          );
        } else {
          // file may exist, try to load from file
          getFormationFile(
            selectedFestival.id,
            formation.name,
            (msg) => { 
              // todo: throw error message on screen
              console.log(msg);
            },
            async (formationDetails) => {
              Promise.all([
                upsertList("formationSection", formationDetails.sections),
                upsertList("participantPosition", formationDetails.participants),
                upsertList("propPosition", formationDetails.props),
                upsertList("notePosition", formationDetails.notes),
                upsertList("arrowPosition", formationDetails.arrows),
                upsertList("placeholder", formationDetails.placeholders),
                upsertList("placeholderPosition", formationDetails.placeholderPositions),
              ]).then(() => {
                updateFormationContext({selectedFormation: formation});
                updatePositionContextState({
                  participantPositions: groupByKey(formationDetails.participants, "formationSectionId"),
                  propPositions: groupByKey(formationDetails.props, "formationSectionId"),
                  notePositions: groupByKey(formationDetails.notes, "formationSectionId"),
                  arrowPositions: groupByKey(formationDetails.arrows, "formationSectionId"),
                  placeholderPositions: groupByKey(formationDetails.placeholderPositions, "formationSectionId"),
                });
                updateEntitiesContext({
                  placeholderList: indexByKey(formationDetails.placeholders, "id"),
                });
              })
            }
          )
        }
      });
  }

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
            {
              (selectedFestival?.formations.length ?? 0) > 1 &&
              <>
                <MenuSeparator/>
                <Menu.SubmenuRoot>
                  <Menu.SubmenuTrigger
                    className="flex flex-row p-1 text-center rounded-md cursor-pointer lg:hover:bg-grey-200">
                      別の隊列を編集 <img className="size-6" src={ICON.chevronForwardBlack}/>
                  </Menu.SubmenuTrigger>
                  <MenuContents position="right">
                    {
                      selectedFestival?.formations.filter(x => !strEquals(x.id, selectedFormation?.id))
                        .map((formation, index) => (
                          <>
                            <MenuItem
                              key={formation.id}
                              label={formation.name}
                              onClick={() => {
                                switchFormation(formation);
                              }}/>
                            {
                              index !== selectedFestival?.formations.length - 2 && <MenuSeparator/>
                            }
                          </>
                      ))
                    }
                  </MenuContents>
                </Menu.SubmenuRoot>
              </>
            }
            {/* <MenuSeparator/>
            <MenuItem label="隊列比較" onClick={() => {
              console.log("Todo: implement formation compare");
            }} />
            <MenuSeparator/>
            <MenuItem label="別の隊列で上書き" onClick={() => {
              console.log("Todo: overwrite formation");
            }} /> */}
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
          <button
            onClick={() => {
              exportFestivalData(selectedFestival!.id);
            }}>
            <img
              alt={"Download Data"}
              className='size-8 max-w-8 max-h-8'
              src={ICON.fileSave}/>
          </button>
          <button
            onClick={() => {
              exportForGithub(selectedFestival!.id)
            }}>
            <img
              alt={"Download Data"}
              className='size-8 max-w-8 max-h-8'
              src={ICON.fileSave}/>
          </button>
          <CustomMenu trigger={
            <img alt="Extra settings" src={ICON.settings} className='size-8 max-w-8 max-h-8'/>
            }>
            <>
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
        <EditFestivalDialog onSave={() => {
          getById("festival", selectedFestival!.id).then(festival => {
            updateState({selectedFestival: festival});
            const formation = festival?.formations.find(f => strEquals(f.id, selectedFormation?.id)) ?? festival?.formations[0];
            switchFormation(formation!);
          });
          setDialogOpen(false);
        }}/>
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
