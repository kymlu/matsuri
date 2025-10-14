import React, { useImperativeHandle, useMemo, useState } from "react";
import { Participant, ParticipantOption } from "../../../models/Participant.ts";
import { teamMembers } from "../../../data/ImaHitotabi.ts";
import { ICON } from "../../../lib/consts.ts";
import CustomMenu, { MenuItem } from "../../CustomMenu.tsx";
import TextInput from "../../TextInput.tsx";
import { isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";
import { CustomAutocomplete } from "../../CustomAutocomplete.tsx";

export type EditFestivalParticipantsProps = {
  participants: Participant[],
  festivalId: string,
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export function EditFestivalParticipants(props: EditFestivalParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([...props.participants.map(x => ({...x}))]);
  const [participantNames, setParticipantNames] = useState<Record<string, number>>({});
  const [editParticipantNameIndex, setEditParticipantNameIndex] = useState<number>(-1);
  const [editingParticipants, setEditingParticipants] = useState<boolean>(false);

  useImperativeHandle(props.ref, () => ({
    getData: () => {return participants;},
    resetData: () => {
      setParticipants([...props.participants.map(x => ({...x}))]);
      updateParticipantNames(props.participants)
    }
  }));

  function updateParticipantNames(participants: Participant[]) {
    const updated: Record<string, number> = participants.reduce((acc, f) => {
      acc[f.displayName] = (acc[f.displayName] || 0) + 1;
      return acc;
    }, {});
    setParticipantNames(updated);
    props.setError?.(
      Object.keys(updated).some(key => isNullOrUndefinedOrBlank(key)) ||
      Object.values(updated).some(count => count > 1)
    );
  }

  const filteredTeam = useMemo(() =>
    teamMembers
      .filter(x => !Object.keys(participantNames).includes(x.name))
      .sort((a, b) => a.name.localeCompare(b.name))
  , [participantNames]);
  
  const addParticipant = (preset?: ParticipantOption) => {
    const updatedParticipants = [
      ...participants,
      {
        id: crypto.randomUUID(),
        displayName: preset?.name || "",
        festivalId: props.festivalId,
        memberId: preset?.id,
        isPlaceholder: false,
        placeholderNumber: Math.max(...participants.map(x => x.placeholderNumber)) + 1,
      } as Participant
    ];
    setParticipants(updatedParticipants);
    updateParticipantNames(updatedParticipants);
  };

  const editParticipantName = (index: number, newName: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].displayName = newName;
    setParticipants(updatedParticipants);
    updateParticipantNames(updatedParticipants);
  };

  const deleteParticipant = (index: number) => {
    setEditParticipantNameIndex(-1);
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
    updateParticipantNames(updatedParticipants);
  };

  const sortParticipants = () => {
    const updatedParticipants = [...participants].sort((a, b) => a.displayName.localeCompare(b.displayName));
    setParticipants(updatedParticipants);
    updateParticipantNames(updatedParticipants);
  }

  return <div>
    <div className="flex flex-row items-center justify-between mb-3">
      <label>参加者</label>
      <div className="flex flex-row gap-2">
        <button
          disabled={teamMembers.length === 0 || editParticipantNameIndex !== -1}
          className={teamMembers.length === 0 || editParticipantNameIndex !== -1 ? "opacity-50" : ""}
          type="button"
          onClick={sortParticipants}
        >
          <img src={ICON.sortByAlphaBlack} className="size-6" alt="Sort" />
        </button>
        <button
          disabled={teamMembers.length === 0}
          className={teamMembers.length === 0 ? "opacity-50" : ""}
          type="button"
          onClick={() => {
            setEditingParticipants(prev => !prev);
            setEditParticipantNameIndex(-1);
          }}
        >
          <img src={editingParticipants ? ICON.editOffBlack : ICON.editBlack} className="size-6" alt="Toggle edit" />
        </button>
      </div>
    </div>
    <CustomAutocomplete
      tall
      placeholder="参加者の名前、かなを入力する"
      items={filteredTeam}
      filter={(item: ParticipantOption, query: string) => item.name.includes(query) || (item.kana?.includes(query) ?? false)}
      getLabel={(item: ParticipantOption) => item.name}
      canAddUndefined
      selectItem={(item: ParticipantOption | string) => addParticipant(typeof item === "string" ? {
        name: item
        } as ParticipantOption : item)}/>
    <div className="flex flex-row items-center gap-2 flex-wrap overflow-auto max-h-[50svh]">
      {
        participants.map((p, i) => {
          const hasError = participantNames[p.displayName] > 1 || isNullOrUndefinedOrBlank(p.displayName);
          return <React.Fragment key={i}>
            <div
              className={
                "flex flex-row gap-2 border-2 border-primary px-2 rounded-lg " +
                (hasError ? "bg-primary-lighter placeholder:text-primary-darker" : "bg-white")
              }>
              { editParticipantNameIndex === i ?
                <TextInput
                  compact
                  hasOutline={false}
                  default={p.displayName}
                  onContentChange={(val) =>{ 
                    editParticipantName(i, val);
                  }}
                  required
                  hasError={hasError}
                  /> : p.displayName
              }
              {
                editingParticipants && 
                <>
                  {
                    editingParticipants && editParticipantNameIndex === i ?
                    <button
                      type="button"
                      disabled={hasError}
                      className={hasError ? "opacity-50" : ""}
                      onClick={() => {setEditParticipantNameIndex(-1)}}>
                      <img className="size-6" src={ICON.checkBlack}/>
                    </button> :
                    <button 
                      type="button"
                      onClick={() => {setEditParticipantNameIndex(i)}}>
                        <img className="size-6" src={ICON.editBlack}/>
                    </button>
                  }
                  <CustomMenu
                    trigger={<img src={ICON.deleteBlack} className="size-6" alt="Delete participant"/>}>
                    <MenuItem label="削除" onClick={() => deleteParticipant(i)} />
                  </CustomMenu>
                </>
              }
            </div>
          </React.Fragment>
        })
      }
    </div>
  </div>
}