import React, { useContext } from "react";
import ExpandableSection from "../ExpandableSection.tsx";
import { UserContext } from "../../contexts/UserContext.tsx";
import Button from "../Button.tsx";

export default function ActionMenu() {
  const {updateState} = useContext(UserContext)
  
  return (
    <ExpandableSection title="アクション" defaultIsExpanded>
      <Button>同カテゴリー選択</Button>
      <Button>削除</Button>
    </ExpandableSection>
  )
}