import React, { useCallback, useContext } from "react";
import CustomDialog from "../CustomDialog.tsx";
import { Festival } from "../../../models/Festival.ts";
import Button from "../../Button.tsx";
import Divider from "../../Divider.tsx";
import { FestivalResources } from "../../../models/ImportExportModel.ts";
import { Formation } from "../../../models/Formation.ts";
import { Prop } from "../../../models/Prop.ts";
import { Participant } from "../../../models/Participant.ts";
import { EditFestivalGeneral } from "./EditFestivalGeneral.tsx";
import { EditFestivalParticipants } from "./EditFestivalParticipants.tsx";
import { EditFestivalProps } from "./EditFestivalProps.tsx";
import { EditFestivalFormations } from "./EditFestivalFormations.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { EntitiesContext } from "../../../contexts/EntitiesContext.tsx";
import { dbController } from "../../../lib/dataAccess/DBProvider.tsx";

export type EditFestivalDialogProps = {
  onSave?: (festival: Festival) => void
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
    general: false,
    formations: false,
    participants: false,
    props: false,
  });

  const handleValidationChange = useCallback((name, hasError) => {
    if (errors[name] !== hasError) {
      setErrors(prev => ({
        ...prev,
        [name]: hasError
      }));
    }
  }, [errors]);
  
  const hasErrors = Object.values(errors).some(Boolean);
  
  const save = () => {
    if (hasErrors) return;

    const generalData: {id?: string, name?: string, startDate?: string, endDate?: string, note?: string} = generalRef.current?.getData();
    const participants: Participant[] = participantsRef.current?.getData();
    const props: Prop[] = propsRef.current?.getData();
    const formations: Formation[] = formationsRef.current?.getData();

    console.log(generalData, participants, props, formations);
    // todo: remove all deleted participants 
    // todo: replace all participant positions with placeholder positions
    // todo: remove all deleted props and prop positions
    // todo: remove formations, and participant, prop, note, arrow, and placeholder positions for that formation

    // dbController.removeList("participant", Object.keys(participantList));
    // dbController.removeList("prop", Object.keys(propList));
    // todo: show I also have a list of removed ids from the participants/props/formations?
    // but if I do that, if I delete an object and add an object will the same name, should it keep the id?
    dbController.upsertItem("festival", {
      id: generalData.id,
      name: generalData.name,
      startDate: generalData.startDate,
      endDate: generalData.endDate,
      note: generalData.note,
      formations: formations,
    } as Festival);
    dbController.upsertList("participant", participants);
    dbController.upsertList("prop", props);
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
