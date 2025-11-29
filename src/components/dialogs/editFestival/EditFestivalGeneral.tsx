import React, { useCallback, useContext, useImperativeHandle, useState } from "react";
import DateInput from "../../DateInput.tsx";
import TextInput from "../../TextInput.tsx";
import { isNullOrUndefinedOrBlank } from "../../../lib/helpers/GlobalHelper.ts";
import { UserContext } from "../../../contexts/UserContext.tsx";

export type EditFestivalGeneralProps = {
  id?: string,
  name?: string,
  startDate?: string,
  endDate?: string,
  note?: string,
  ref?: React.Ref<any>,
  setError?: (hasError: boolean) => void
}

export function EditFestivalGeneral(props: EditFestivalGeneralProps) {
    const {selectedFestival} = useContext(UserContext);
  
  const [id, setId] = useState(props.id ?? "");
  const [name, setName] = useState(props.name?.toString() ?? "");
  const [startDate, setStartDate] = useState(props.startDate?.toString() ?? "");
  const [endDate, setEndDate] = useState(props.endDate?.toString() ?? "");
  const [note, setNote] = useState(props.note?.toString() ?? "");
  const [endDateError, setEndDateError] = useState(false);

  const idRef = React.createRef<any>();
  const nameRef = React.createRef<any>();
  const startDateRef = React.createRef<any>();
  const endDateRef = React.createRef<any>();
  const noteRef = React.createRef<any>();

  useImperativeHandle(props.ref, () => ({
    getData: () => {return {id, name, startDate, endDate, note};},
    resetData: () => {
      setId(props.id ?? "");
      idRef.current?.changeValue(props.id?.toString() ?? "");
      setName(props.name ?? "");
      nameRef.current?.changeValue(props.name?.toString() ?? "");
      setStartDate(props.startDate ?? "");
      startDateRef.current?.changeValue(props.startDate?.toString() ?? "");
      setEndDate(props.endDate ?? "");
      endDateRef.current?.changeValue(props.endDate?.toString() ?? "");
      setNote(props.note ?? "");
      noteRef.current?.changeValue(props.note?.toString() ?? "");
    },
  }));

  const onDateChange = useCallback(
    (field: "start" | "end", value: string) => {
      if (field === "start") {
        setStartDate(value);
      } else {
        setEndDate(value);
      }
      
      const start = field === "start" ? value : startDate;
      const end = field === "end" ? value : endDate;
      const errorVal = !isNullOrUndefinedOrBlank(start) &&
        !isNullOrUndefinedOrBlank(end) &&
        new Date(start).getTime() > new Date(end).getTime();
      setEndDateError(errorVal);
      reevaluateError(id, name, start, errorVal);
    },
    [startDate, endDate]
  );

  const reevaluateError = (id: string, name: string, startDate: string, endDateError: boolean) => {
    console.log("reevaluateError", {id, name, startDate, endDateError});
    props.setError?.( 
      isNullOrUndefinedOrBlank(id) || 
      isNullOrUndefinedOrBlank(name) || 
      isNullOrUndefinedOrBlank(startDate) || 
      endDateError
    );
  }

  const editId = (newId: string) => {
    if(selectedFestival) return;
    const formattedId = newId.replace(/[^a-zA-Z0-9]/g, "")
    setId(formattedId);
    idRef.current?.changeValue(formattedId);
    reevaluateError(formattedId, name, startDate, endDateError); // Todo: check id already exists
  }

  return <>
    <label>
      ID (英数字のみ)
      <span className="block text-xs text-gray-500">
        ※ 確定後に編集することはできません
        <br/>
        例: 20250830Domatsuri
      </span>
      <TextInput
        name="id"
        ref={idRef}
        disabled={!!selectedFestival}
        tall
        default={id}
        placeholder="IDを入力"
        required
        onContentChange={(val) => {
          editId(val);
        }}
      />
    </label>
    <label>
      祭り名
      <TextInput
        tall
        ref={nameRef}
        name="name"
        default={name}
        placeholder="祭りの名前を入力"
        required
        onContentChange={(val) => {
          setName(val);
          reevaluateError(id, val, startDate, endDateError);
        }}
        showLength
      />
    </label>
    <div className="flex flex-row portrait:flex-col gap-x-3">
      <label>
        開始日
        <DateInput
          required
          ref={startDateRef}
          tall
          name="startDate"
          default={startDate}
          onDateChange={(date) => {
            onDateChange("start", date);
          }}
        />
      </label>
      <label>
        終了日（任意）
        <DateInput
          ref={endDateRef}
          name="endDate"
          tall
          default={endDate}
          onDateChange={(date) => {
            onDateChange("end", date);
          }}
          hasError={endDateError}
        />
      </label>
    </div>
    <label>
      メモ（任意）
      <TextInput
        tall
        ref={noteRef}
        name="note"
        default={note}
        placeholder="メモを入力"
        onContentChange={(val) => {
          setNote(val);
        }}
        maxLength={100}
        showLength
      />
    </label>
  </>
}