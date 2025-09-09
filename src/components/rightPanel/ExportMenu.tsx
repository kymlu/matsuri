import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import TextInput from "../TextInput.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";

export default function ExportMenu() {
  const { selectedFestival, selectedFormation } = useContext(UserContext);
  const [exportName, setExportName] = React.useState(selectedFestival?.name + (selectedFormation ? ` - ${selectedFormation.name}` : ''));

  return (
    <ExpandableSection title="エキスポート">
      
      <div className="flex flex-row gap-2">
        <TextInput
          placeholder="ファイル名を入力"
          text={exportName}
          onContentChange={(newName) => setExportName(newName)}/>
        <span>.png</span>
      </div>
      <Button onClick={() => {}}>PDFにエキスポート(無効)</Button>
    </ExpandableSection>
  )
}