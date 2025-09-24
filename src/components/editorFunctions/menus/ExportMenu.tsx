import React, { useContext } from "react";
import ExpandableSection from "../../ExpandableSection.tsx";
import Button from "../../Button.tsx";
import TextInput from "../../TextInput.tsx";
import { UserContext } from "../../../contexts/UserContext.tsx";
import { ICON } from "../../../data/consts.ts";
import { FormationContext } from "../../../contexts/FormationContext.tsx";

export type ExportMenuProps = {
  exportFunc?: (exportName: string) => void
}

export default function ExportMenu(props: ExportMenuProps) {
  const { selectedFestival } = useContext(UserContext);
  const {selectedFormation} = useContext(FormationContext);
  var defaultName = selectedFestival?.name + (selectedFormation ? ` - ${selectedFormation.name}` : '');
  const [exportName, setExportName] = React.useState(defaultName);

  function exportPdf() {
    props.exportFunc?.(exportName);
  }

  return (
    <ExpandableSection
      title="エクスポート"
      titleIcon={ICON.downloadBlack}>
      <div className="flex flex-row gap-2">
        <TextInput
          placeholder="ファイル名を入力"
          text={exportName}
          onContentChange={(newName) => setExportName(newName)}/>
        <span>.pdf</span>
      </div>
      <div className="place-self-end">
        <Button primary label="Export PDF" onClick={() => {exportPdf()}}>エクスポート</Button>
      </div>
    </ExpandableSection>
  )
}