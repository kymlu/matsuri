import React, { useContext } from 'react';
import { UserContext } from '../contexts/UserContext.tsx';
import Button from '../components/Button.tsx';
import FormationLeftPanel from '../components/leftPanel/FormationLeftPanel.tsx';
import FormationRightPanel from '../components/rightPanel/FormationRightPanel.tsx';
import { useNavigate } from 'react-router-dom';
import FormationEditor from '../components/editor/FormationEditor.tsx';

export default function FormationEditorPage () {
  const {selectedFestival, selectedFormation, selectedSection} = useContext(UserContext)
  const navigate = useNavigate()

  return (
      <div className='h-full overflow-hidden'>
        <div className='h-full overflow-hidden grid grid-cols-[300px,auto,300px] grid-rows-[auto,1fr]'>
          <header className='flex items-center justify-between w-full col-span-3 gap-10 px-4 py-2 border-b-2 border-black border-solid'>
            <Button onClick={() => {navigate("../")}}>ホームに戻る</Button>
            {
            selectedFormation && selectedFestival && 
            <h1 className='font-bold'>
              Editing {selectedSection?.songSection?.name} {selectedFormation?.name} ({selectedFormation.length} x {selectedFormation.width}) @ {selectedFestival?.name}
            </h1>
            }
            <Button onClick={() => {
                localStorage.removeItem("formationManager");
                indexedDB.deleteDatabase("MatsuriDB");
            }}>Delete cache</Button>
            </header>
          <FormationLeftPanel/>
          <div className='overflow-scroll'>
            <FormationEditor width={selectedFormation?.width ?? 20} height={selectedFormation?.length ?? 20}/>
          </div>
          {/* todo: warnings if some people aren't in all sections */}
          {/* todo: warning if some people are in other categories */}
          <FormationRightPanel/>
        </div>
      </div>
    )
}