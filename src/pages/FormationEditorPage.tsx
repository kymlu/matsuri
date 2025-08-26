import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import Button from '../components/Button.tsx';
import FormationLeftPanel from '../components/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/FormationEditor.tsx';

export default function FormationEditorPage () {
  const {selectedFestival, selectedFormation} = useContext(UserContext)
  const navigate = useNavigate()
  return (
    <div className='h-full overflow-hidden'>
      <div className='grid grid-cols-[300px,auto,300px] grid-rows-[auto,1fr]'>
        <header className='col-span-3 flex gap-10 items-center justify-between py-2 px-4 w-full bg-fuchsia-300'>
          <Button onClick={() => {navigate("../")}}>ホームに戻る</Button>
          {
          selectedFormation && selectedFestival && 
          <h1>
            Editing {selectedFormation?.name} @ {selectedFestival?.name}
          </h1>
          }
          <Button>エキスポート</Button>
          </header>
        <FormationLeftPanel/>
        <div className='overflow-scroll'>
          <FormationEditor><></></FormationEditor>
        </div>
        {/* todo: warnings if some people aren't in all sections */}
        {/* todo: warning if some people are in other categories */}
        <FormationRightPanel/>
      </div>
    </div>
  )
}