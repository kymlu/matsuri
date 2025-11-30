import React, { useCallback, useContext } from "react";
import CustomDialog from "../CustomDialog.tsx";
import { Festival } from "../../../models/Festival.ts";
import Button from "../../Button.tsx";
import Divider from "../../Divider.tsx";
import { FestivalResources } from "../../../models/ImportExportModel.ts";
import { EditFestivalGeneral } from "./EditFestivalGeneral.tsx";
import { EditFestivalParticipants, ParticipantWithEditState } from "./EditFestivalParticipants.tsx";
import { EditFestivalProps, PropWithEditState } from "./EditFestivalProps.tsx";
import { EditFestivalFormations, FormationWithEditState } from "./EditFestivalFormations.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { getAll, removeList, upsertItem, upsertList } from "../../../data/DataRepository.ts";
import { FormationSection } from "../../../models/FormationSection.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";

export type EditFestivalDialogProps = {
  onSave?: (festival: Festival) => void
}

export type EditState = {
  isNew: boolean,
  isDeleted: boolean,
}

export function EditFestivalDialog(props: EditFestivalDialogProps) {
  const {selectedFestival} = useContext(UserContext);
  const {participantList, propList} = useContext(EntitiesContext);
  
  const defaultFestival: Festival & FestivalResources = {
    id: selectedFestival?.id || "",
    name: selectedFestival?.name || "",
    startDate: selectedFestival?.startDate || "",
    endDate: selectedFestival?.endDate || "",
    note: selectedFestival?.note || "",
    formations: [...selectedFestival?.formations || []],
    participants: [...Object.values(participantList) || []],
    props: [...Object.values(propList) || []],
  };

  const generalRef = React.createRef<any>();
  const formationsRef = React.createRef<any>();
  const participantsRef = React.createRef<any>();
  const propsRef = React.createRef<any>();
  const [errors, setErrors] = React.useState({
    general: selectedFestival == null,
    formations: selectedFestival == null,
    participants: false,
    props: false,
  });

  const handleValidationChange = useCallback((name: "general" | "formations" | "participants" | "props", hasError: boolean) => {
    console.log(`Validation change for ${name}: ${hasError}. All errors: `, errors);
    if (errors[name] !== hasError) {
      setErrors(prev => ({
        ...prev,
        [name]: hasError
      }));
    }
  }, [errors]);
  
  const hasErrors = Object.values(errors).some(Boolean);
  
  const save = async () => {
    if (hasErrors) return;

    const generalData: {id?: string, name?: string, startDate?: string, endDate?: string, note?: string} = generalRef.current?.getData();
    const participants: ParticipantWithEditState[] = participantsRef.current?.getData()
      .map((p: ParticipantWithEditState) => ({
        ...p,
        festivalId: generalData.id
      } as ParticipantWithEditState));
    const propsList: PropWithEditState[] = propsRef.current?.getData()
      .map((p: PropWithEditState) => ({
        ...p,
        festivalId: generalData.id
      } as PropWithEditState));
    const formationData: {formations?: FormationWithEditState[], newSections?: FormationSection[]} = formationsRef.current?.getData();

    console.log(generalData, participants, propsList, formationData);
    // remove all deleted formations
    const deletedFormations = formationData.formations?.filter(f => f.isDeleted) || [];
    const deletedFormationIds = new Set(deletedFormations.map(f => f.id));
    await Promise.all([
      getAll("formationSection"),
      getAll("participantPosition"),
      getAll("propPosition"),
      getAll("placeholderPosition"),
      getAll("notePosition"),
      getAll("arrowPosition"),
      getAll("placeholder"),
    ]).then(async ([formationSections, participantPositions, propPositions, placeholderPositions, notePositions, arrowPositions, placeholders]) => {
      const sectionsToDelete = formationSections.filter(fs => deletedFormationIds.has(fs.formationId));
      const sectionIdsToDelete = new Set(sectionsToDelete.map(fs => fs.id));
      
      const participantPositionsToDelete = participantPositions.filter(pp => sectionIdsToDelete.has(pp.formationSectionId));
      const propPositionsToDelete = propPositions.filter(pp => sectionIdsToDelete.has(pp.formationSectionId));
      const placeholderPositionsToDelete = placeholderPositions.filter(pp => sectionIdsToDelete.has(pp.formationSectionId));
      const notePositionsToDelete = notePositions.filter(pp => sectionIdsToDelete.has(pp.formationSectionId));
      const arrowPositionsToDelete = arrowPositions.filter(pp => sectionIdsToDelete.has(pp.formationSectionId));
      const placeholdersToDelete = placeholders.filter(p => deletedFormationIds.has(p.formationId));
      
      await Promise.all([
        removeList("formationSection", [...sectionIdsToDelete]),
        removeList("participantPosition", participantPositionsToDelete.map(pp => pp.id)),
        removeList("propPosition", propPositionsToDelete.map(pp => pp.id)),
        removeList("placeholderPosition", placeholderPositionsToDelete.map(pp => pp.id)),
        removeList("notePosition", notePositionsToDelete.map(pp => pp.id)),
        removeList("arrowPosition", arrowPositionsToDelete.map(pp => pp.id)),
        removeList("placeholder", placeholdersToDelete.map(p => p.id)),
      ]);
      
    });

    // remove all deleted participants and their positions
    const deletedParticipants = participants.filter(p => p.isDeleted);
    const deletedParticipantIds = new Set(deletedParticipants.map(p => p.id));
    removeList("participant", [...deletedParticipantIds]);

    getAll("participantPosition").then((positions) => {
      const positionsToDelete = positions.filter(pp => deletedParticipantIds.has(pp.participantId));
      removeList("participantPosition", positionsToDelete.map(pp => pp.id));
      // Todo: see if replacing deleted participants with placeholders is necessary
    });

    // remove all deleted props and their positions
    const deletedPropIds = new Set(propsList.filter(p => p.isDeleted).map(p => p.id));
    removeList("prop", [...deletedPropIds]);
    getAll("propPosition").then((positions) => {
      const positionsToDelete = positions.filter(pp => deletedPropIds.has(pp.propId)).map(pp => pp.id);
      removeList("propPosition", positionsToDelete);
    });

    const formationsToKeep = formationData.formations
      ?.filter(f => !f.isDeleted)
      .map(f => {
        const { isNew, isDeleted, ...formation } = f;
        return formation;
      });

    const participantsToKeep = participants
      .filter(p => !p.isDeleted)
      .map(p => {
        const { isNew, isDeleted, ...participant } = p;
        return participant;
      });

    const propsToKeep = propsList
      .filter(p => !p.isDeleted)
      .map(p => {
        const { isNew, isDeleted, ...prop } = p;
        return prop;
      });

    var newFestival: Festival = {
      id: generalData.id,
      name: generalData.name,
      startDate: generalData.startDate,
      endDate: generalData.endDate,
      note: generalData.note,
      formations: formationsToKeep || [],
    } as Festival;

    Promise.all([
      upsertItem("festival", newFestival),
      upsertList("participant", participantsToKeep),
      upsertList("prop", propsToKeep),
      upsertList("formationSection", formationData.newSections || []),
    ]).then(() => {
      console.log("Festival and related data saved.");
      props.onSave?.(newFestival);
    });
  };

  const reset = () => {
    generalRef.current?.resetData();
    participantsRef.current?.resetData();
    propsRef.current?.resetData();
    formationsRef.current?.resetData(); // TODO: fix
  }

  return (
    <CustomDialog full hasX title="祭り情報編集">
      <form>
        <EditFestivalGeneral
          id={defaultFestival.id}
          name={defaultFestival.name}
          startDate={defaultFestival.startDate}
          endDate={defaultFestival.endDate}
          note={defaultFestival.note}
          ref={generalRef}
          setError={(hasError) => {handleValidationChange("general", hasError)}}
          />

        <Divider/>

        <EditFestivalFormations
          formations={defaultFestival.formations}
          ref={formationsRef}
          setError={(hasError) => {handleValidationChange("formations", hasError)}}
          />

        <Divider/>

        <EditFestivalParticipants
          festivalId={defaultFestival.id}
          participants={defaultFestival.participants}
          ref={participantsRef}
          setError={(hasError) => {handleValidationChange("participants", hasError)}}
          />
          
        <Divider/>
        
        <EditFestivalProps
          props={defaultFestival.props}
          ref={propsRef}
          setError={(hasError) => {handleValidationChange("props", hasError)}}
          />
      </form>

      <div className="flex justify-end gap-2">
        <Button onClick={reset} label="Reset">リセット</Button>
        <Button
          disabled={hasErrors}
          primary
          onClick={save}
          label="Save festival data"
          type="submit"
        >
          保存
        </Button>
      </div>
    </CustomDialog>
  )
}
