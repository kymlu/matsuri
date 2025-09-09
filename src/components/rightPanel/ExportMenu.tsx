import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import Button from "../Button.tsx";
import TextInput from "../TextInput.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import { isNullOrUndefinedOrBlank } from "../helpers/GlobalHelper.ts";

export type ExportMenuProps = {
  exportFunc?: (fileName: string) => void
}

export default function ExportMenu(props: ExportMenuProps) {
  const { selectedFestival, selectedFormation } = useContext(UserContext);
  var defaultName = selectedFestival?.name + (selectedFormation ? ` - ${selectedFormation.name}` : '');
  const [exportName, setExportName] = React.useState(defaultName);

  function exportPdf() {
    props.exportFunc?.(isNullOrUndefinedOrBlank(exportName) ? defaultName! : exportName);
  }

  return (
    <ExpandableSection title="エキスポート">
      
      <div className="flex flex-row gap-2">
        <TextInput
          placeholder="ファイル名を入力"
          text={exportName}
          onContentChange={(newName) => setExportName(newName)}/>
        <span>.pdf</span>
      </div>
      <Button onClick={() => {exportPdf()}}>PDFにエキスポート</Button>
    </ExpandableSection>
  )
}