import * as React from 'react';
import { ScrollArea } from '@base-ui-components/react/scroll-area';

export type CustomScrollAreaProps = {
  children: React.ReactNode
}

export default function CustomScrollArea(props: CustomScrollAreaProps) {
  return (
    <ScrollArea.Root className="h-[8.5rem] w-96 max-w-[calc(100vw-8rem)]">
      <ScrollArea.Viewport className="h-full rounded-md overscroll-contain outline outline-1 -outline-offset-1 outline-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-800">
        {props.children}
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="m-2 flex w-1 justify-center rounded bg-gray-200 opacity-0 transition-opacity delay-300 data-[hovering]:opacity-100 data-[hovering]:delay-0 data-[hovering]:duration-75 data-[scrolling]:opacity-100 data-[scrolling]:delay-0 data-[scrolling]:duration-75">
        <ScrollArea.Thumb className="w-full bg-gray-500 rounded" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
