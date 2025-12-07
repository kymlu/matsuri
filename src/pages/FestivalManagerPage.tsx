import { useContext, useEffect, useState } from 'react';

import '../index.css';
import Button from '../components/Button.tsx';
import { Festival } from '../models/Festival.ts';
import { UserContext } from '../contexts/UserContext.tsx';
import { useNavigate } from 'react-router-dom';
import { Formation } from '../models/Formation.ts';
import Divider from '../components/Divider.tsx';
import { DEFAULT_GRID_SIZE, ICON, LAST_UPDATED } from '../lib/consts.ts';
import { AppModeContext } from '../contexts/AppModeContext.tsx';
import { FormationContext } from '../contexts/FormationContext.tsx';
import { VisualSettingsContext } from '../contexts/VisualSettingsContext.tsx';
import allFestivals from "../data/allFestivals.json"
import { formatJapaneseDateRange } from '../lib/helpers/DateHelper.ts';
import CustomDialog from '../components/dialogs/CustomDialog.tsx';
import { Dialog } from '@base-ui-components/react/dialog';
import { EditFestivalDialog } from '../components/dialogs/editFestival/EditFestivalDialog.tsx';
import { getFestivalMetaFile, readResourcesAndAllFormations, readResourcesAndFormation } from '../lib/helpers/JsonReaderHelper.ts';
import { FestivalMeta, FestivalResources, FormationDetails } from '../models/ImportExportModel.ts';
import { songList } from '../data/ImaHitotabi.ts';
import { groupByKey, indexByKey } from '../lib/helpers/GroupingHelper.ts';
import { CategoryContext } from '../contexts/CategoryContext.tsx';
import { EntitiesContext } from '../contexts/EntitiesContext.tsx';
import { PositionContext } from '../contexts/PositionContext.tsx';
import ItemButton from '../components/ItemButton.tsx';
import { clearAllData, GetAllForFormation } from '../data/DataController.ts';
import { getAll, upsertItem, upsertList } from '../data/DataRepository.ts';
import { FormationSection } from '../models/FormationSection.ts';
import { Participant, ParticipantPlaceholder } from '../models/Participant.ts';
import { ParticipantPosition, PropPosition, ArrowPosition, NotePosition, PlaceholderPosition } from '../models/Position.ts';
import { Prop } from '../models/Prop.ts';
import { strEquals } from '../lib/helpers/GlobalHelper.ts';
import ActionDialog from '../components/dialogs/ActionDialog.tsx';
import { exportFestivalData } from '../lib/helpers/ExportHelper.ts';

export default function FestivalManagerPage () {
  const {updateState} = useContext(UserContext);
  const {updateCategoryContext} = useContext(CategoryContext);
  const {updateVisualSettingsContext} = useContext(VisualSettingsContext);
  const {updateFormationContext} = useContext(FormationContext);
  const {updatePositionContextState} = useContext(PositionContext);
  const {updateEntitiesContext} = useContext(EntitiesContext);

  const {updateAppModeContext} = useContext(AppModeContext);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState<boolean>(false);
  const [editingFestival, setEditingFestival] = useState<boolean>(false);
  const [enableDownload, setEnableDownload] = useState<boolean>(true);
  const [savedFestival, setSavedFestival] = useState<Festival | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
  const [festivalData, setFestivalData] = useState<Festival[]>([]);
  const [overwriteMode, setOverwriteMode] = useState<null | "existing" | "new" | "upload">(null);
  let navigate = useNavigate();
  const uploadFileElement = document.getElementById("uploadFileInput");

  useEffect(() => {
    updateAppModeContext({userType: "admin"});
    getFestivalData();
    getAll("festival").then((festival) => {
      setSavedFestival(festival[0]);
    })
  }, []);

  const getFestivalData = async () => {
    Promise.all((
      allFestivals.festivals as FestivalMeta[])
        .map((x => getFestivalMetaFile(x, () => {}, async () => {})
    ))).then((festivals: (Festival | undefined)[]) => {
      setFestivalData(festivals.filter(x => x !== undefined));
    });
  }

  const navigateToFormationEditor = () => {
    navigate("/formation");
  }

  const selectSavedFestival = () => {
    if (!savedFestival) return;

    GetAllForFormation(savedFestival.id, savedFestival.formations[0].id, (
      formationSections,
      participants,
      props,
      placeholders,
      participantPositions,
      propPositions,
      notePositions,
      arrowPositions,
      placeholderPositions
    ) => {
      setDataBeforeNavigation(
        savedFestival,
        savedFestival.formations[0],
        {
          participants: participants,
          props: props
        },
        {
          sections: formationSections,
          participants: participantPositions,
          props: propPositions,
          notes: notePositions,
          arrows: arrowPositions,
          placeholderPositions: placeholderPositions,
          placeholders: placeholders,
        }
      )
      navigateToFormationEditor();
    });
  }

  const selectExistingFestival =(festival: Festival, formation: Formation) => {
    if (savedFestival) {
      setSelectedFestival(festival);
      setSelectedFormation(formation);
      setOverwriteMode("existing");
      setShowConfirmOverwrite(true);
    } else {
      loadFormation(festival, formation);
    }
  }

  const loadFormation = (festival: Festival, formation: Formation) => {
    clearAllData()
    setSelectedFestival(null);
    setSelectedFormation(null);
    readResourcesAndAllFormations(
      festival,
      (msg) => {
        setErrorMessage(`${formation.name}の隊列データの取得に失敗しました。\n ${msg}`);
        setHasError(true);
      },
      (resources, formationDetails) => {
        saveToDatabase(festival, resources, formationDetails);
        setDataBeforeNavigation(festival, formation, resources, formationDetails.find(x => strEquals(x.sections[0].formationId, formation.id))!);
        navigateToFormationEditor();
      });
  }

  const saveToDatabase = (festival: Festival, resources: FestivalResources, formationDetails: FormationDetails[]) => {
    upsertItem("festival", festival);
    upsertList("participant", resources.participants);
    upsertList("prop", resources.props);
    upsertList("formationSection", formationDetails.flatMap(x => x.sections));
    upsertList("participantPosition", formationDetails.flatMap(x => x.participants));
    upsertList("propPosition", formationDetails.flatMap(x => x.props));
    upsertList("notePosition", formationDetails.flatMap(x => x.notes));
    upsertList("arrowPosition", formationDetails.flatMap(x => x.arrows));
    upsertList("placeholder", formationDetails.flatMap(x => x.placeholders));
    upsertList("placeholderPosition", formationDetails.flatMap(x => x.placeholderPositions));
  }

  const setDataBeforeNavigation = (festival: Festival, formation: Formation, resources: FestivalResources, formationDetails: FormationDetails) => {
    updateVisualSettingsContext({followingId: null, gridSize: DEFAULT_GRID_SIZE});

    updateFormationContext({selectedFormation: formation});

    updateCategoryContext({categories: songList[formation!.songId].categories});

    var groupedParticipantPositions = groupByKey(formationDetails.participants, "formationSectionId")
    var groupedPropPositions = groupByKey(formationDetails.props, "formationSectionId")
    updateEntitiesContext({
      participantList: indexByKey(resources.participants, "id"),
      propList: indexByKey(resources.props, "id"),
      placeholderList: indexByKey(formationDetails.placeholders, "id"),
    });

    updatePositionContextState({
      participantPositions: groupedParticipantPositions,
      propPositions: groupedPropPositions,
      notePositions: groupByKey(formationDetails.notes, "formationSectionId"),
      arrowPositions: groupByKey(formationDetails.arrows, "formationSectionId"),
      placeholderPositions: groupByKey(formationDetails.placeholderPositions, "formationSectionId"),
    });

    const currentSections = formationDetails.sections.sort((a,b) => a.order - b.order);

    updateState({
      isLoading: false,
      previousSectionId: null,
      currentSections: currentSections,
      selectedSection: currentSections[0],
      selectedFestival: festival,
      selectedItems: [],
      showNotes: true,
    });

    updateAppModeContext({userType: "admin", appMode: "edit"});
  }

  const onAddNewFestivalClick = () => {
    if (savedFestival) {
      setOverwriteMode("new");
      setShowConfirmOverwrite(true);
    } else {
      setSelectedFestival(null);
      setEditingFestival(true);
    }
  }

  const onSaveNewFestival = (newFestival: Festival) => {
    setEditingFestival(false);
    navigateToFormationEditor();

    GetAllForFormation(newFestival.id, newFestival.formations[0].id, (
      formationSections,
      participants,
      props,
      placeholders,
      participantPositions,
      propPositions,
      notePositions,
      arrowPositions,
      placeholderPositions
    ) => {
      setDataBeforeNavigation(
        newFestival,
        newFestival.formations[0],
        {
          participants: participants,
          props: props
        },
        {
          sections: formationSections,
          participants: participantPositions,
          props: propPositions,
          notes: notePositions,
          arrows: arrowPositions,
          placeholderPositions: placeholderPositions,
          placeholders: placeholders,
        }
      )
      navigateToFormationEditor();
    });
  }

  const onUploadButtonClick = () => {
    if (savedFestival) {
      setOverwriteMode("upload");
      setShowConfirmOverwrite(true);
    } else {
      triggerUpload();
    }
  }

  const triggerUpload = () => {
    if (uploadFileElement){
      uploadFileElement.click();
    }
  }

  const readUploadedFile = (file: File) => {
    const reader = new FileReader();
  
    reader.addEventListener(
      "load",
      (event) => {
        if (event.target?.result) {
          try {
            const uploadResult = JSON.parse(event.target.result.toString());

            var missingFields: string[] = [];
            if (!uploadResult.festival) missingFields.push("festival");
            if (!uploadResult.formationSections) missingFields.push("formationSections");
            if (!uploadResult.participants) missingFields.push("participants");
            if (!uploadResult.participantPositions) missingFields.push("participantPositions");
            if (!uploadResult.props) missingFields.push("props");
            if (!uploadResult.propPositions) missingFields.push("propPositions");
            if (!uploadResult.arrowPositions) missingFields.push("arrowPositions");
            if (!uploadResult.notes) missingFields.push("notes");
            if (!uploadResult.placeholders) missingFields.push("placeholders");
            if (!uploadResult.placeholderPositions) missingFields.push("placeholderPositions");
            if (missingFields.length > 0) {
              throw new Error("Missing fields: " + missingFields.join(", "));
            }

            var invalidFormatFields: string[] = [];

            if(!Array.isArray(uploadResult.festival)) invalidFormatFields.push("festival");
            if(!Array.isArray(uploadResult.formationSections)) invalidFormatFields.push("formationSections");
            if(!Array.isArray(uploadResult.participants)) invalidFormatFields.push("participants");
            if(!Array.isArray(uploadResult.participantPositions)) invalidFormatFields.push("participantPositions");
            if(!Array.isArray(uploadResult.props)) invalidFormatFields.push("props");
            if(!Array.isArray(uploadResult.propPositions)) invalidFormatFields.push("propPositions");
            if(!Array.isArray(uploadResult.arrowPositions)) invalidFormatFields.push("arrowPositions");
            if(!Array.isArray(uploadResult.notes)) invalidFormatFields.push("notes");
            if(!Array.isArray(uploadResult.placeholders)) invalidFormatFields.push("placeholders");
            if(!Array.isArray(uploadResult.placeholderPositions)) invalidFormatFields.push("placeholderPositions");
            if (invalidFormatFields.length > 0) {
              throw new Error("Invalid format for fields: " + invalidFormatFields.join(", "));
            }

            if (uploadResult.festival.length === 0) {
              throw new Error("No festival found");
            } else if (uploadResult.festival.length > 1) {
              throw new Error("Multiple festivals found");
            }
            
            const festival = uploadResult.festival[0] as Festival;
            const formations = new Set(festival.formations.map(formation => formation.id));
            if (formations.size === 0) { throw new Error("No formations found"); }

            const formationSections = (uploadResult.formationSections as FormationSection[])
              .filter(section => formations.has(section.formationId));
            
            if (formationSections.length === 0) { throw new Error("No formation sections found"); }

            const fsIds = new Set(formationSections.map(section => section.id));

            const filteredParticipants = (uploadResult.participants as Participant[]).filter(participant => strEquals(participant.festivalId, festival.id));
            const filteredProps = (uploadResult.props as Prop[]).filter(prop => strEquals(prop.festivalId, festival.id));
            const filteredPlaceholders = (uploadResult.placeholders as ParticipantPlaceholder[]).filter(placeholder => formations.has(placeholder.formationId));

            const filteredParticipantPositions = (uploadResult.participantPositions as ParticipantPosition[]).filter(x => fsIds.has(x.formationSectionId));
            const filteredPropPositions = (uploadResult.propPositions as PropPosition[]).filter(x => fsIds.has(x.formationSectionId));
            const filteredNotePositions = (uploadResult.notes as NotePosition[]).filter(x => fsIds.has(x.formationSectionId));
            const filteredArrowPositions = (uploadResult.arrowPositions as ArrowPosition[]).filter(x => fsIds.has(x.formationSectionId));
            const filteredPlaceholderPositions = (uploadResult.placeholderPositions as PlaceholderPosition[]).filter(x => fsIds.has(x.formationSectionId));

            saveToDatabase(
              festival,
              {
                participants: filteredParticipants,
                props: filteredProps,
              },
              [
                {
                  sections: formationSections,
                  participants: filteredParticipantPositions,
                  props: filteredPropPositions,
                  notes: filteredNotePositions,
                  arrows: filteredArrowPositions,
                  placeholders: filteredPlaceholders,
                  placeholderPositions: filteredPlaceholderPositions,
                }
              ]
            );

            const firstFormation = festival.formations[0];
            const firstFormationSections = formationSections.filter(section => strEquals(section.formationId, firstFormation.id));
            const sectionIds = new Set(firstFormationSections.map(section => section.id));
            setDataBeforeNavigation(
              festival,
              firstFormation,
              {
                participants: filteredParticipants,
                props: filteredProps,
              },
              {
                sections: firstFormationSections,
                participants: filteredParticipantPositions.filter(x => sectionIds.has(x.formationSectionId)),
                props: filteredPropPositions.filter(x => sectionIds.has(x.formationSectionId)),
                notes: filteredNotePositions.filter(x => sectionIds.has(x.formationSectionId)),
                arrows: filteredArrowPositions.filter(x => sectionIds.has(x.formationSectionId)),
                placeholders: filteredPlaceholders.filter(x => strEquals(x.formationId, firstFormation.id)),
                placeholderPositions: filteredPlaceholderPositions.filter(x => sectionIds.has(x.formationSectionId)),
              }
            );
            navigateToFormationEditor();
          } catch (error) {
            console.error("Failed to upload file:", error);
            setErrorMessage(`アップロードされたファイルの形式が正しくありません。別のファイルをアップロードしてください。`);
            setHasError(true);
            return;
          }
        }
      },
      false,
    );

    try {
      reader.readAsText(file);
    } catch {
      console.error("No file was read.");
    }
  }

  const onConfirmOverwrite = async () => {
    if (savedFestival && enableDownload) {
      await exportFestivalData(savedFestival.id);
    }
    
    clearAllData();
    setSavedFestival(null);
    setShowConfirmOverwrite(false);
    updateState({selectedFestival: null, selectedSection: null, currentSections: [], selectedItems: []});
    updateEntitiesContext({participantList: {}, propList: {}, placeholderList: {}});

    switch (overwriteMode) {
      case "existing":
        if (selectedFestival && selectedFormation) {
          loadFormation(selectedFestival, selectedFormation);
        }
        break;
      case "new":
        setEditingFestival(true);
        break;
      case "upload":
        triggerUpload();
        break;
    }
  }

  return (
    <div className='flex flex-col w-full gap-2 my-10 landscape:max-w-[65svw] landscape:mx-auto'>
      <div className='flex items-center justify-between mx-4'>
        <h1 className='text-2xl font-bold'>隊列編集</h1>
        <button
          className='p-2 text-sm rounded-md text-grey-400 hover:bg-grey-100'
          onClick={() => navigate("..")}>
          一般の方はこちらへ
        </button>
      </div>
      <Divider primary/>
      {
        savedFestival &&
        <div className='flex-1 mx-5'>
          <button
            className='flex flex-row items-center justify-between w-full p-5 font-semibold text-white transition-colors border-2 rounded-md border-primary bg-primary hover:bg-primary-light'
            onClick={() => {selectSavedFestival()}}>
            <span>編集中：{savedFestival.name}</span>
            <div className='flex gap-2'>
              <span>編集に続く</span>
              <img src={ICON.chevronForwardWhite} className='size-6' alt='Edit saved formation'/>
            </div>
          </button>
          <Divider primary/>
        </div>
      }
      <div className='grid gap-4 mx-5 landscape:grid-cols-2'>
        <Button onClick={() => onAddNewFestivalClick()}>
          <div className='flex flex-row items-center justify-center gap-2 p-1'>
            祭りを追加
            <img
              src={ICON.addBlack}
              className="size-6"
              alt="Add new festival"/>
          </div>
        </Button>
        <Button onClick={() => onUploadButtonClick()}>
          <div className='flex flex-row items-center justify-center gap-2 p-1'>
            隊列をアップロード
            <img
              src={ICON.uploadBlack}
              className="size-6"
              alt="Upload a file"/>
          </div>
        </Button>
        <input className='hidden' type="file" id="uploadFileInput" accept=".mtr"
          onChange={(event) => {
            console.log(event.target.files);
            if (event.target.files) {
              var file = event.target.files?.[0];
              readUploadedFile(file);
            }
          }}/>
      </div>
      {
        festivalData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .map((festival) => <FestivalSelector key={festival.id} festival={festival} onFormationClick={selectExistingFestival}/>
        )
      }
      <span className='fixed opacity-50 bottom-2 left-2'>{LAST_UPDATED}</span>
      <Dialog.Root
        open={editingFestival}
        onOpenChange={() => setEditingFestival(false)}
        onOpenChangeComplete={() => () => {
          if (!hasError){
            setSelectedFestival(null);
            setEditingFestival(false);
          }}}>
        {
          editingFestival &&
          <EditFestivalDialog onSave={(festival) => onSaveNewFestival(festival)}/>
        }
      </Dialog.Root>
      
      <Dialog.Root
        dismissible
        open={hasError}
        onOpenChange={() => setHasError(false)}
        onOpenChangeComplete={() => (!hasError) && setErrorMessage(null)}>
        {
          errorMessage &&
          <CustomDialog title="エラー">
            {errorMessage}
            <div className='flex justify-end mt-4'>
              <Button label="閉じる" onClick={() => setHasError(false)}>閉じる</Button>
            </div>
          </CustomDialog>
        }
      </Dialog.Root>
      
      <Dialog.Root
        open={showConfirmOverwrite}>
        {
          <ActionDialog
            title="上書きの確認"
            onCancel={() => setShowConfirmOverwrite(false)}
            onConfirm={() => onConfirmOverwrite()}>
            <div className='flex flex-col gap-4'>
              <span>
                <b>{savedFestival?.name}</b>の隊列データは保存されています。<br/>
                新しい祭りデータで上書きしてもよろしいですか？
              </span>
              <div>
                <label>
                  <input
                    defaultChecked={enableDownload}
                    name="download"
                    type="checkbox"
                    onChange={(e) => {setEnableDownload(e.target.checked)}}/>
                  既存のデータをダウンロードする
                </label>
              </div>
            </div>
          </ActionDialog>
        }
      </Dialog.Root>
    </div>
  )
}

type FestivalSelectorProps = {
  festival: Festival,
  onFormationClick: (festival: Festival, formation: Formation) => void
}

function FestivalSelector({festival, onFormationClick}: FestivalSelectorProps) {
  return <div
    key={festival.id}
    className='flex flex-col gap-1 mx-10 mb-4 rounded-lg'>
    <h2 className='text-xl font-bold text-primary'>{festival.name}</h2>
    <span className='text-sm text-grey-400'>{formatJapaneseDateRange(festival.startDate, festival.endDate)}</span>
    <div className='font-normal'>{festival.note}</div>
    <div className='flex flex-row flex-wrap gap-2'>
      {
        festival.formations.map(formation => (
          <ItemButton key={formation.name} text={formation.name} onClick={() => onFormationClick(festival, formation)}/>
        ))
      }
    </div>
  </div>
}